import { Material } from "../Material";
import { getProgram } from "./TextureProgram"

export class TextureMaterial extends Material {

  #texture: HTMLImageElement | null = null

  setTexture(tex: HTMLImageElement) {
    this.#texture = tex
  }

  getProgramForRender(gl: WebGLRenderingContext) {
    const p = getProgram(gl)
    if (this.#texture) {
      p.setTexture(this.#texture)
    }
    return p
  }
}