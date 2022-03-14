import { AttributeType, Node } from "./nodes/Node"
import { Wire } from "./Wire"

export class Graph {
  #nodes: Node[] = []
  #wires: Wire[] = []

  constructor() {}

  addNode(node: Node) {
    this.#nodes.push(node)
    this.resolveGraph()
  }

  getNodes(): Node[] {
    return [...this.#nodes]
  }

  addWire(wire: Wire) {
    this.#wires.push(wire)
    this.resolveGraph()
  }

  getWires(): Wire[] {
    return [...this.#wires]
  }

  resolveGraph() {
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