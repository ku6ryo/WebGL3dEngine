import { createValidNumberLiteral } from "../../utils";
import { Node } from "../Node";
import { SocketType } from "../Socket";


export class FloatInputNode extends Node {

  #value: number = 0

  constructor(id: string) {
    super(id, "FloatInput")
    this.addOutSocket("floatInputNodeOut", SocketType.Float)
  }

  getValue(): number {
    return this.#value
  }

  setValue(value: number) {
    this.#value = value
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    const outputs = this.getOutSockets()
    const v = createValidNumberLiteral(this.#value)
    return `
    float ${outputs[0].getVeriableName()} = ${v};
    `
  }
}