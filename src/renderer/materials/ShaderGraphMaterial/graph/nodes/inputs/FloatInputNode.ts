import { createValidNumberLiteral } from "../../utils";
import { Node } from "../../Node";
import { ShaderDataType } from "../../data_types";


export class FloatInputNode extends Node {

  #value: number = 0

  constructor(id: string) {
    super(id, "FloatInput")
    this.addOutSocket("floatInputNodeOut", ShaderDataType.Float)
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