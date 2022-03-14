import { Camera } from "./Camera"
import { Thing } from "./Thing"
import { DirectionalLight } from "./lights/DirectionalLight"

export class Renderer {

  #canvas: HTMLCanvasElement
  #things: Thing[] = []
  #directionalLights: DirectionalLight[] = []

  constructor() {
    this.#canvas = document.createElement("canvas")
  }

  getCanvas() {
    return this.#canvas
  }

  private getContext() {
    const glContext = this.#canvas.getContext("webgl")
    if (!glContext) {
      throw new Error("WebGL is not supported")
    }
    return glContext
  }

  addThing(t: Thing) {
    this.#things.push(t)
  }

  getThings() {
    return [...this.#things]
  }

  addDirectionalLight(light: DirectionalLight) {
    this.#directionalLights.push(light)
  }

  render(camera: Camera) {
    const glContext = this.getContext()
    glContext.viewport(0, 0, glContext.canvas.width, glContext.canvas.height);
    glContext.frontFace(glContext.CCW)
    glContext.enable(glContext.CULL_FACE)
    glContext.cullFace(glContext.BACK)
    glContext.enable(glContext.DEPTH_TEST);
    glContext.depthFunc(glContext.LEQUAL);
    glContext.enable(glContext.BLEND);
    glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE_MINUS_SRC_ALPHA);

    glContext.clearColor(0, 0, 0, 0);
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    const things = this.getThings().sort((a, b) => {
      const at = a.getMaterial().useTransparency() ? 1 : 0 
      const bt = b.getMaterial().useTransparency() ? 1 : 0
      return at - bt < 0 ? -1 : 1
    })

    things.forEach(t => {
      const m = t.getMaterial()
      m.getProgramForRender(glContext).draw(camera, t, this.#directionalLights)
    })
  }

}