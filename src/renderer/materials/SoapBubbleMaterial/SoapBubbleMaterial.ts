import { Material } from "../Material";
import { getProgram } from "./SoapBubbleProgram"

export class SoapBubbleMaterial extends Material {

  constructor() {
    super()
  }

  getProgramForRender(gl: WebGLRenderingContext) {
    const p = getProgram(gl)
    return p
  }
}