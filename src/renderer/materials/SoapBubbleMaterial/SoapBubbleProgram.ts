import vertexShaderSource from "./shader.vert";
import fragmentShaderSource from "./shader.frag";
import { Camera } from "../../Camera";
import { Thing } from "../../Thing";
import LightColorTextureUrl from "./light_color_map.png";
import { BasicProgram } from "../BasicProgram";

let program: SoapBubbleProgram | null = null

export function getProgram(context: WebGLRenderingContext) {
  if (program) {
    return program
  }
  program = new SoapBubbleProgram(context)
  return program
}

enum SoapBubbleProgramUniform {
  EyeDirection = "uEyeDirection",
  LightColorMap = "uLightColorMap",
}

class SoapBubbleProgram extends BasicProgram {

  #colorMapImage: HTMLImageElement | null = null

  constructor(context: WebGLRenderingContext) {
    super(context, vertexShaderSource, fragmentShaderSource, {
      useDirectionalLights: true,
      useModelInvertMatrix: true,
    })
    this.createUniformLocation(SoapBubbleProgramUniform.EyeDirection)
    this.createTextureLocation(SoapBubbleProgramUniform.LightColorMap, 0)

    const img = new Image()
    img.src = LightColorTextureUrl
    img.onload = () => {
      this.#colorMapImage = img
    }
    img.onerror = () => {
      console.error("SoapBubbleProgram Failed to load image")
    }
  }
  
  preDraw(camera: Camera, thing: Thing) {
    if (!this.#colorMapImage) {
      // throw new Error("SoapBubbleProgram Image not loaded")
      return
    }
    const gl = this.getContext()
    const p = camera.getPosition()
    const t = camera.getTarget()
    const eyeDir = t.subtract(p).normalize()
    gl.uniform3f(
      this.getUniformLocation(SoapBubbleProgramUniform.EyeDirection),
      eyeDir.x, eyeDir.y, eyeDir.z
    )
    this.setTextureValue(SoapBubbleProgramUniform.LightColorMap, this.#colorMapImage)
  }
}