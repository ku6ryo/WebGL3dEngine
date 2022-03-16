import Stats from "stats.js"
import { TorusGeometry } from "./renderer/geometries/TorusGeometry"
import { Vector3 } from "./renderer/math/Vector3";
import { Camera } from "./renderer/Camera";
import { Renderer } from "./renderer/Renderer";
import { Thing } from "./renderer/Thing";
import { StandardMaterial } from "./renderer/materials/StandardMaterial/StandardMaterial";
import { DirectionalLight } from "./renderer/lights/DirectionalLight";
import { Graph } from "./renderer/materials/ShaderGraphMaterial/graph/Graph";
import { ShaderGraphMaterial } from "./renderer/materials/ShaderGraphMaterial/ShaderGraphMaterial";

const stats = new Stats()
document.body.appendChild(stats.dom)

export class ShaderPreview {

  #targetThing: Thing
  #renderer: Renderer
  #camera: Camera

  constructor() {
    const w = 960
    const h = 540
    const renderer = new Renderer()
    const glCanvas = renderer.getCanvas()
    glCanvas.width = w
    glCanvas.height = h
    glCanvas.style.height = "100vh"
    glCanvas.style.width = "100vw"
    glCanvas.style.maxHeight = `calc(100vw * ${h / w})`
    glCanvas.style.maxWidth = `calc(100vh * ${w / h})`
    glCanvas.width = w
    glCanvas.height = h
    document.querySelector(".container")!.appendChild(glCanvas)

    const camera = new Camera()
    camera.setPosition(new Vector3(0, 0, -5))
    camera.setTarget(new Vector3(0, 0, 0))
    camera.setUp(new Vector3(0, 1, 0))
    camera.setProjectionParams(Math.PI / 4, glCanvas.width / glCanvas.height, 0.1, 100)

    const light = new DirectionalLight(new Vector3(0, -1, 1), 1)
    renderer.addDirectionalLight(light)
    renderer.addDirectionalLight(new DirectionalLight(new Vector3(1, 1, 1), 1))

    const mat = new StandardMaterial()
    const torus = new Thing(new TorusGeometry(0.5, 50, 100))
    torus.setMaterial(mat)
    renderer.addThing(torus)

    this.#renderer = renderer
    this.#targetThing = torus
    this.#camera = camera
  }

  update(graph: Graph) {
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
    stats.begin()
    this.#targetThing.setRotation(new Vector3(0, Math.PI * performance.now() / 1000, 0))
    this.#renderer.render(this.#camera)
    stats.end()
  }

  start() {
    const loop = () => {
      this.render()
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
}