import { AttributeType, Node } from "./Node"
import { Wire } from "./Wire"

export class Graph {
  #nodes: Node[] = []
  #wires: Wire[] = []

  constructor() {}

  /**
   * Adds a node to the graph.
   */
  addNode(node: Node) {
    this.#nodes.push(node)
    this.resolveGraph()
  }

  /**
   * Gets all nodes in the graph. 
   */
  getNodes(): Node[] {
    return [...this.#nodes]
  }

  /**
   * Addes a wire to the graph.
   */
  addWire(wire: Wire) {
    this.#wires.push(wire)
    this.resolveGraph()
  }

  /**
   * Gets all wires in the graph.
   */
  getWires(): Wire[] {
    return [...this.#wires]
  }

  /**
   * Resolve graph structure. Orders of nodes etc.
   */
  protected resolveGraph() {
    this.#nodes.forEach(n => {
      n.getUniforms().forEach((u, i) => {
        const name = `u${n.getId()}_${i}_${u.type}`
        n.setUnifromName(i, name)
      })
    })
  }

  generateVertCode(): string {
    let attributeCode = ""
    let mainCode = ""
    const attributeMap: Map<AttributeType, boolean> = new Map()
    this.#nodes.forEach(n => {
      n.getAttributes().forEach(a => {
        attributeMap.set(a, true)
      })
    })
    if (attributeMap.get(AttributeType.UV)) {
      attributeCode += `
      attribute vec2 aUV;
      varying vec2 vUV;
      `
      mainCode += "vUV = aUV;\n"
    }
    return `
precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;
${attributeCode}

uniform mat4 uMvpMatrix;
varying vec3 vNormal;

void main() {
  gl_Position = uMvpMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal;
  ${mainCode}
}
    `
  }

  generateFragCode(): string {
    let uniformCode = ""
    let attributeCode = ""
    let mainCode = ""
    const attributeMap: Map<AttributeType, boolean> = new Map()
    this.#nodes.forEach(n => {
      n.getAttributes().forEach(a => {
        attributeMap.set(a, true)
      })
      n.getUniforms().forEach((u) => {
        uniformCode += `uniform ${u.type} ${u.name};\n`
      })
      mainCode += n.generateCode()
      const oSockets = n.getOutSockets()
      oSockets.forEach(s => {
        const w = this.#wires.find(w => {
          return w.getInSocket() === s
        }) 
        if (w) {
          mainCode += w.generateCode()
        }
      })
    })
    if (attributeMap.get(AttributeType.UV)) {
      attributeCode += "varying vec2 vUV;\n"
    }
    return `
precision mediump float;

${uniformCode}

varying vec3 vNormal;
${attributeCode}

void main() {
${mainCode}
}
    `
  }
}