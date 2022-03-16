import vertexShaderSource from "./shader.vert?raw";
import fragmentShaderSource from "./shader.frag?raw";
import { Color } from "../../math/Color";
import { Camera } from "../../Camera";
import { Thing } from "../../Thing";
import { BasicProgram } from "../BasicProgram";

let program: PhongProgram | null = null

export function getProgram(context: WebGLRenderingContext) {
  if (program) {
    return program
  }
  program = new PhongProgram(context)
  return program
}

enum PhongProgramUniform {
  Color = "uColor",
  EyeDirection = "uEyeDirection",
}

class PhongProgram extends BasicProgram {

  #color: Color = new Color(1, 1, 1, 1)

  constructor(context: WebGLRenderingContext) {
    super(context, vertexShaderSource, fragmentShaderSource)
    this.createUniformLocation(PhongProgramUniform.Color)
    this.createUniformLocation(PhongProgramUniform.EyeDirection)
  }

  setColor(color: Color) {
    this.#color = color
  }
  
  preDraw(camera: Camera, _: Thing) {
    const p = camera.getPosition()
    const t = camera.getTarget()
    const eyeDir = t.subtract(p).normalize()

    this.getContext().uniform4f(
      this.getUniformLocation(PhongProgramUniform.Color),
      this.#color.r, this.#color.g, this.#color.b, this.#color.a
    )
    this.getContext().uniform3f(
      this.getUniformLocation(PhongProgramUniform.EyeDirection),
      eyeDir.x, eyeDir.y, eyeDir.z
    )
  }
}