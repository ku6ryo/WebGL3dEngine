import { Node, UniformType } from "../../Node";
import { ShaderDataType } from "../../data_types";

export class TimeInputNode extends Node {

  constructor(id: string) {
    super(id, "Input_Time", [UniformType.Float], undefined, false, true)
    this.setUniformValue(0, 0)
    this.addOutSocket("TimeInputNodeOut", ShaderDataType.Float)
  }

  updateOnDraw(): void {
    this.setUniformValue(0, performance.now() / 1000)
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    const uName = this.getUnifromName(0)
    this.getOutSockets()[0].overrideVariableName(uName)
    return ""
  }
}