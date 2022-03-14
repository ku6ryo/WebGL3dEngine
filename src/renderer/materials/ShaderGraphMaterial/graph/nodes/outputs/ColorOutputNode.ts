import { Node } from "../../Node";
import { ShaderDataType } from "../../data_types";


export class ColorOutputNode extends Node {

  constructor(id: string) {
    super(id, "ColorOutput", undefined, undefined, true)
    this.addInSocket("in0", ShaderDataType.Vector4)
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    const inputs = this.getInSockets()
    return `
    gl_FragColor = ${inputs[0].getVeriableName()};
    `
  }
}