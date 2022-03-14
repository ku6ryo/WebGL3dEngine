import { Node } from "../../Node";
import { ShaderDataType, ShaderVectorTypes } from "../../data_types";

const SupportedTypes = ShaderVectorTypes.concat([ShaderDataType.Float]);

export class MultiplyNode extends Node {

  #type: ShaderDataType

  constructor(id: string, type: ShaderDataType) {
    if (!SupportedTypes.includes(type)) {
      throw new Error("Unsupported type: " + type)
    }
    super(id, "Math_Multiply")
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
    ${this.#type} ${outputs[0].getVeriableName()} = ${inputs[0].getVeriableName()} * ${inputs[1].getVeriableName()};
    `
  }
}