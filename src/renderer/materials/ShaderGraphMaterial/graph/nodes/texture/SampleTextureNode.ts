import { Node } from "../Node";
import { SocketType } from "../Socket";


export class SampleTextureNode extends Node {

  constructor(id: string) {
    super(id, "Math_Add")
    this.addInSocket("tex", SocketType.Sampler2D)
    this.addInSocket("uv", SocketType.Vector2)
    this.addOutSocket("color", SocketType.Vector4)
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    const inputs = this.getInSockets()
    const outputs = this.getOutSockets()
    return `
    vec4 ${outputs[0].getVeriableName()} = texture2D(${inputs[0].getVeriableName()}, ${inputs[1].getVeriableName()});
    `
  }
}