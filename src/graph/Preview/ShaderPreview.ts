import { TorusGeometry } from "../../renderer/geometries/TorusGeometry"
import { Vector3 } from "../../renderer/math/Vector3";
import { Camera } from "../../renderer/Camera";
import { Renderer } from "../../renderer/Renderer";
import { Thing } from "../../renderer/Thing";
import { StandardMaterial } from "../../renderer/materials/StandardMaterial/StandardMaterial";
import { DirectionalLight } from "../../renderer/lights/DirectionalLight";
import { ShaderGraph } from "../../renderer/materials/ShaderGraphMaterial/graph/ShaderGraph";
import { ShaderGraphMaterial } from "../../renderer/materials/ShaderGraphMaterial/ShaderGraphMaterial";
import { ConeGeometry } from "../../renderer/geometries/ConeGeometry";

export class ShaderPreview {

  #targetThing: Thing
  #renderer: Renderer
  #camera: Camera
  #canvas: HTMLCanvasElement

  constructor() {
    const renderer = new Renderer()
    const glCanvas = renderer.getCanvas()

    this.#canvas = glCanvas
    this.#canvas.width = 600
    this.#canvas.height = 600

    const camera = new Camera()
    camera.setPosition(new Vector3(0, 0, -5))
    camera.setTarget(new Vector3(0, 0, 0))
    camera.setUp(new Vector3(0, 1, 0))
    camera.setProjectionParams(Math.PI / 4, glCanvas.width / glCanvas.height, 0.1, 100)

    const light = new DirectionalLight(new Vector3(0, -1, 1), 1)
    renderer.addDirectionalLight(light)
    renderer.addDirectionalLight(new DirectionalLight(new Vector3(1, 1, 1), 1))

    const mat = new StandardMaterial()
    // const torus = new Thing(new TorusGeometry(0.5, 50, 100))
    const torus = new Thing(new ConeGeometry(30))
    torus.setMaterial(mat)
    renderer.addThing(torus)

    this.#renderer = renderer
    this.#targetThing = torus
    this.#camera = camera
  }

  getCanvas() {
    return this.#canvas
  }

  update(graph: ShaderGraph) {
    console.log(graph.generateVertCode())
    console.log(graph.generateFragCode())
    try {
      this.#targetThing.setMaterial(new ShaderGraphMaterial(graph))
    } catch (e) {
      console.error(e)
      this.#targetThing.setMaterial(new StandardMaterial())
    }
  }

  render() {
    this.#targetThing.setRotation(new Vector3(0, Math.PI * performance.now() / 1000, 0))
    this.#renderer.render(this.#camera)
  }

  start() {
    const loop = () => {
      this.render()
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
}