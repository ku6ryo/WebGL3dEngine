import { Program } from "./Program";

export abstract class Material {

  constructor() {}

  abstract getProgramForRender(context: WebGLRenderingContext): Program
}