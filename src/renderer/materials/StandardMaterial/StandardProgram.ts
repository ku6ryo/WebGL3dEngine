import vertexShaderSource from "./shader.vert";
import fragmentShaderSource from "./shader.frag";
import { Program } from "../Program";
import { Color } from "../../math/Color";
import { Camera } from "../../Camera";
import { Thing } from "../../Thing";

let program: StandardProgram | null = null

export function getProgram(context: WebGLRenderingContext) {
  if (program) {
    return program
  }
  program = new StandardProgram(context)
  return program
}

class StandardProgram extends Program {
  #uColorLocation: WebGLUniformLocation

  #color: Color = new Color(1, 1, 1, 1)

  constructor(context: WebGLRenderingContext) {
    super(context, vertexShaderSource, fragmentShaderSource)
    this.#uColorLocation = this.createUniformLocation("color")
  }

  setColor(color: Color) {
    this.#color = color
  }

  prepare(_: Camera, __: Thing): void {
    this.getContext().uniform4f(this.#uColorLocation, this.#color.r, this.#color.g, this.#color.b, this.#color.a)
  }
}