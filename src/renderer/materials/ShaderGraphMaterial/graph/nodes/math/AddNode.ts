import { Node } from "../../Node";
import { SocketType } from "../../Socket";


export class AddNode extends Node {

  #type: SocketType

  constructor(id: string, type: SocketType) {
    super(id, "Math_Add")
    this.#type = type
    this.addInSocket("in0", type)
    this.addInSocket("in1", type)
    this.addOutSocket("out", type)
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    const inputs = this.getInSockets()
    const outputs = this.getOutSockets()
    return `
    ${this.#type} ${outputs[0].getVeriableName()} = ${inputs[0].getVeriableName()} + ${inputs[1].getVeriableName()};
    `
  }
}