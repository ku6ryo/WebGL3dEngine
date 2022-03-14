import { Node } from "./nodes/Node"
import { Wire } from "./Wire"

export class Graph {
  #nodes: Node[] = []
  #wires: Wire[] = []

  constructor() {}

  addNode(node: Node) {
    this.#nodes.push(node)
  }

  getNodes(): Node[] {
    return [...this.#nodes]
  }

  addWire(wire: Wire) {
    this.#wires.push(wire)
  }

  getWires(): Wire[] {
    return [...this.#wires]
  }

  generateVertCode(): string {
    return `
precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uMvpMatrix;
varying vec3 vNormal;

void main() {
  gl_Position = uMvpMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal;
}
    `
  }

  generateFragCode(): string {
    let mainCode = ""
    this.#nodes.forEach(n => {
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
    return `
precision mediump float;

uniform mat4 uMiMatrix;
uniform vec3 uEyeDirection;
uniform vec4 uDirectionalLights[3];

varying vec3 vNormal;

void main() {
${mainCode}
}
    `
  }
}