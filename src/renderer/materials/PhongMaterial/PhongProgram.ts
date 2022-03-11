import vertexShaderSource from "./shader.vert";
import fragmentShaderSource from "./shader.frag";
import { Program } from "../Program";
import { Color } from "../../math/Color";
import { Camera } from "../../Camera";
import { Thing } from "../../Thing";

let program: PhongProgram | null = null

export function getProgram(context: WebGLRenderingContext) {
  if (program) {
    return program
  }
  program = new PhongProgram(context)
  return program
}

class PhongProgram extends Program {

  #color: Color = new Color(1, 1, 1, 1)

  #uColorLocation: WebGLUniformLocation
  #uEyeDirectionLocation: WebGLUniformLocation

  constructor(context: WebGLRenderingContext) {
    super(context, vertexShaderSource, fragmentShaderSource)
    this.#uColorLocation = this.createUniformLocation("color")
    this.#uEyeDirectionLocation = this.createUniformLocation("eyeDirection")
  }

  setColor(color: Color) {
    this.#color = color
  }
  
  prepare(camera: Camera, thing: Thing) {
    const p = camera.getPosition()
    const t = camera.getTarget()
    const eyeDir = t.subtract(p).normalize()
    this.getContext().uniform4f(this.#uColorLocation, this.#color.r, this.#color.g, this.#color.b, this.#color.a)
    this.getContext().uniform3f(this.#uEyeDirectionLocation, eyeDir.x, eyeDir.y, eyeDir.z)
  }
}