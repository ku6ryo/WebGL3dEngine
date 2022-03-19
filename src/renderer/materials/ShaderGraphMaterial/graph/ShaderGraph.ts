import { AttributeType, ShaderNode } from "./ShaderNode"
import { Wire } from "./Wire"

export class ShaderGraph {
  #nodes: ShaderNode[] = []
  #wires: Wire[] = []

  /**
   * Nodes that are effective. The order is sorted for code generation.
   */
  #resolvedNodes: ShaderNode[] = []

  /**
   * Adds a node to the graph.
   */
  addNode(node: ShaderNode) {
    if (this.#nodes.map(n => n.getId()).includes(node.getId())) {
      throw new Error("the same node id already exists : " + node.getId())
    }
    this.#nodes.push(node)
    this.resolveGraph()
  }

  /**
   * Gets all nodes in the graph. 
   */
  getNodes(): ShaderNode[] {
    return [...this.#nodes]
  }

  getResolvedNodes(): ShaderNode[] {
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
    let outputNode: ShaderNode | null = null
    let outputNodeCount = 0
    this.#nodes.forEach(n => {
      if (n.isOutputNode()) {
        outputNode = n
        outputNodeCount++
      }
    })
    if (!outputNode) {
      throw new Error("No output node found")
    }
    if (outputNodeCount > 1) {
      throw new Error("More than one output node found")
    }

    const nodeMap: { [key: string]: ShaderNode } = {}
    const addNodeToMap = (n: ShaderNode, order: string) => {
      nodeMap[order] = n
      console.log("a")
      n.getInSockets().forEach((s, i) => {
        const nextOrder = order + Array(i + 1).fill("_")
        const wires = this.#wires.filter(w => {
          return w.getOutSocket() === s
        })
        console.log("b")
        console.log(n)
        console.log(this.#wires)
        console.log(wires)
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
        addNodeToMap(nn, nextOrder)
      }) 
    }
    addNodeToMap(outputNode as ShaderNode, "")
    const resolvedNodes: ShaderNode[] = []
    Object.keys(nodeMap).sort((a, b) => {
      return b.length - a.length
    }).forEach(k => {
      // Removes duplications.
      const n = nodeMap[k]
      if (!resolvedNodes.includes(n)) {
        resolvedNodes.push(n)
      }
    })
    this.#resolvedNodes = resolvedNodes
  }

  generateVertCode(): string {
    console.log(this.#resolvedNodes)
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
    let commonCode = ""
    let mainCode = ""
    let commonCodes: { [key: string]: string } = {}

    const attributeMap: Map<AttributeType, boolean> = new Map()
    this.#resolvedNodes.forEach(n => {
      const cCode = n.generateCommonCode()
      if (cCode && !commonCodes[n.getTypeId()]) {
        commonCode += cCode + "\n"
      }
      n.getAttributes().forEach(a => {
        attributeMap.set(a, true)
      })
      n.getUniforms().forEach((u) => {
        uniformCode += `uniform ${u.type} ${u.name};\n`
      })
      mainCode += n.generateCode()
      const oSockets = n.getOutSockets()
      oSockets.forEach(s => {
        const wires = this.#wires.filter(w => {
          return w.getInSocket() === s
        })
        wires.forEach(w => {
          mainCode += w.generateCode()
        })
      })
    })
    if (attributeMap.get(AttributeType.UV)) {
      attributeCode += "varying vec2 vUV;\n"
    }
    commonCode += Object.values(commonCodes).join("\n")
    return `
precision mediump float;

${uniformCode}

varying vec3 vNormal;
${attributeCode}

${commonCode}

void main() {
${mainCode}
}
    `
  }
}