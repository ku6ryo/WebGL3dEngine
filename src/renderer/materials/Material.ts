import { Program } from "./Program"

export abstract class Material {

  constructor() {}

  useTransparency() {
    return false
  }

  abstract getProgramForRender(context: WebGLRenderingContext): Program
}