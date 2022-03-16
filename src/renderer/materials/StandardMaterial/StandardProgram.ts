import vertexShaderSource from "./shader.vert?raw";
import fragmentShaderSource from "./shader.frag?raw";
import { Color } from "../../math/Color";
import { Camera } from "../../Camera";
import { Thing } from "../../Thing";
import { BasicProgram } from "../BasicProgram";

let program: StandardProgram | null = null

export function getProgram(context: WebGLRenderingContext) {
  if (program) {
    return program
  }
  program = new StandardProgram(context)
  return program
}

enum StandardProgramUniform {
  Color = "uColor",
}

class StandardProgram extends BasicProgram {

  #color: Color = new Color(1, 1, 1, 1)

  constructor(context: WebGLRenderingContext) {
    super(context, vertexShaderSource, fragmentShaderSource, {
      useDirectionalLights: true,
      useModelInvertMatrix: true,
    })
    this.createUniformLocation(StandardProgramUniform.Color)
  }

  setColor(color: Color) {
    this.#color = color
  }

  preDraw(_: Camera, __: Thing): void {
    this.getContext().uniform4f(
      this.getUniformLocation(StandardProgramUniform.Color),
      this.#color.r, this.#color.g, this.#color.b, this.#color.a
    )
  }
}