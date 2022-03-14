import { AttributeType, Node } from "./Node"
import { Wire } from "./Wire"

export class Graph {
  #nodes: Node[] = []
  #wires: Wire[] = []

  /**
   * Nodes that are effective. The order is sorted for code generation.
   */
  #resolvedNodes: Node[] = []

  /**
   * Adds a node to the graph.
   */
  addNode(node: Node) {
    if (this.#nodes.map(n => n.getId()).includes(node.getId())) {
      throw new Error("the same node id already exists : " + node.getId())
    }
    this.#nodes.push(node)
    this.resolveGraph()
  }

  /**
   * Gets all nodes in the graph. 
   */
  getNodes(): Node[] {
    return [...this.#nodes]
  }

  getResolvedNodes(): Node[] {
    return [...this.#resolvedNodes]
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

    let outputNode: Node | null = null
    let outputNodeCount = 0
    this.#nodes.forEach(n => {
      if (n.isOutputNode()) {
        outputNode = n
        outputNodeCount++
      }
    })
    if (outputNodeCount > 1) {
      throw new Error("More than one output node found")
    }
    if (!outputNode) {
      return
    }

    const nodeMap: { [key: string]: Node } = {}
    const addNodeToMap = (n: Node, order: string) => {
      nodeMap[order] = n
      n.getInSockets().forEach((s, i) => {
        const wires = this.#wires.filter(w => {
          return w.getOutSocket() === s
        })
        if (wires.length > 1) {
          throw new Error("no wire or in socket has more than 1 wires connected to in socket " + s.getId())
        }
        if (wires.length === 0) {
          return
        }
        const wire = wires[0]
        const inSocket = wire.getInSocket()
        const nn = this.#nodes.find(n => {
          return n.getOutSockets().includes(inSocket)
        })
        if (!nn) {
          return
        }
        addNodeToMap(nn, order + Array(i + 1).fill("_"))
      }) 
    }
    addNodeToMap(outputNode as Node, "")
    this.#resolvedNodes = Object.keys(nodeMap).sort((a, b) => {
      return b.length - a.length
    }).map(k => {
      return nodeMap[k]
    })
  }

  generateVertCode(): string {
    let attributeCode = ""
    let mainCode = ""
    const attributeMap: Map<AttributeType, boolean> = new Map()
    this.#resolvedNodes.forEach(n => {
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
    this.#resolvedNodes.forEach(n => {
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