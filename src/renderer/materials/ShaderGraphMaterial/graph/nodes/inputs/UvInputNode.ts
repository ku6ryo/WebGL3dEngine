import { AttributeType, Node } from "../../Node";
import { SocketType } from "../../Socket";

export class UvInputNode extends Node {

  constructor(id: string) {
    super(id, "UvInput", [], [AttributeType.UV])
    this.addOutSocket("TextureInputNodeOut", SocketType.Vector2)
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    this.getOutSockets()[0].overrideVariableName("vUV")
    return ""
  }
}