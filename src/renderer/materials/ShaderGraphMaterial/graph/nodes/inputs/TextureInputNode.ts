import { Node, UniformType } from "../Node";
import { SocketType } from "../Socket";

export class TextureInputNode extends Node {

  #value: HTMLImageElement;

  constructor(id: string, value: HTMLImageElement) {
    super(id, "Input_Texture", [UniformType.Sampler2D])
    this.#value = value
    this.setUniformValue(0, value)
    this.addOutSocket("TextureInputNodeOut", SocketType.Sampler2D)
  }

  getValue(): HTMLImageElement {
    return this.#value
  }

  setValue(value: HTMLImageElement) {
    this.#value = value
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