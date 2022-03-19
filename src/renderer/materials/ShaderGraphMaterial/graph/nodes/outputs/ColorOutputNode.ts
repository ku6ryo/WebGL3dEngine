import { ShaderNode } from "../../ShaderNode";
import { ShaderDataType } from "../../data_types";


export class ColorOutputNode extends ShaderNode {

  constructor(id: string) {
    super(id, "ColorOutput", undefined, true, true)
    this.addInSocket("in0", ShaderDataType.Vector3)
  }

  generateCommonCode(): string {
    return ""
  }

  generateCode(): string {
    const inputs = this.getInSockets()
    return `
    gl_FragColor = vec4(${inputs[0].getVeriableName()}, 1.0);
    `
  }
}