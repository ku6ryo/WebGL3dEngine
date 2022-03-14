import { AttributeType, Node } from "../../Node";
import { ShaderDataType } from "../../data_types";

export class UvInputNode extends Node {

  constructor(id: string) {
    super(id, "UvInput", [], [AttributeType.UV])
    this.addOutSocket("TextureInputNodeOut", ShaderDataType.Vector2)
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    this.getOutSockets()[0].overrideVariableName("vUV")
    return ""
  }
}