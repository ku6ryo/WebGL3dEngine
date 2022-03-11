import { Material } from "../Material";
import { getProgram } from "./PhongProgram"
import { Color } from "../../math/Color";

export class PhongMaterial extends Material {

  #color: Color = new Color(1, 1, 1, 1)

  setColor(color: Color) {
    this.#color = color
  }

  getProgramForRender(gl: WebGLRenderingContext) {
    const p = getProgram(gl)
    p.setColor(this.#color)
    return p
  }
}