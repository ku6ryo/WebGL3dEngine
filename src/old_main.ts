import Stats from "stats.js"
import { TorusGeometry } from "./renderer/geometries/TorusGeometry"
import { BoxGeometry } from "./renderer/geometries/BoxGeometry";
import { Vector3 } from "./renderer/math/Vector3";
import { Camera } from "./renderer/Camera";
import { Renderer } from "./renderer/Renderer";
import { Thing } from "./renderer/Thing";
import { StandardMaterial } from "./renderer/materials/StandardMaterial/StandardMaterial";
import { Color } from "./renderer/math/Color";
import { ConeGeometry } from "./renderer/geometries/ConeGeometry";
import { PhongMaterial } from "./renderer/materials/PhongMaterial/PhongMaterial";
import { DirectionalLight } from "./renderer/lights/DirectionalLight";
import { SoapBubbleMaterial } from "./renderer/materials/SoapBubbleMaterial/SoapBubbleMaterial";
import sampleTexUrl from "./crack512x512.png"
import { PlaneGeometry } from "./renderer/geometries/PlaneGeometry";
import { TextureMaterial } from "./renderer/materials/TextureMaterial/TextureMaterial";
import { Graph } from "./renderer/materials/ShaderGraphMaterial/graph/Graph";
import { FloatInputNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/FloatInputNode";
import { ColorOutputNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/outputs/ColorOutputNode";
import { Wire } from "./renderer/materials/ShaderGraphMaterial/graph/Wire";
import { ShaderGraphMaterial } from "./renderer/materials/ShaderGraphMaterial/ShaderGraphMaterial";
import { AddNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/math/AddNode";
import { ShaderDataType } from "./renderer/materials/ShaderGraphMaterial/graph/data_types";
import { Vector4InputNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/Vector4InputNode";
import { Vector4 } from "./renderer/math/Vector4";
import { TextureInputNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/TextureInputNode";
import { SampleTextureNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/texture/SampleTextureNode";
import { UvInputNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/UvInputNode";
import { TimeInputNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/TimeInputNode";
import { FracNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/math/FracNode";
import { MultiplyNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/math/MultiplyNode";
import { DotNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/math/DotNode";
import { TangentNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/math/TangentNode";
import { SineNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/math/SineNode";
import { PerlinNoiseNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/noises/ParlinNoiseNode";

const stats = new Stats()
document.body.appendChild(stats.dom)

export async function main() {
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

  const img = new Image()
  img.src = sampleTexUrl
  img.onload = () => {
    const g = new Graph()
    const uv0 = new UvInputNode("uv0")
    g.addNode(uv0)


    const p0 = new PerlinNoiseNode("p0")
    g.addNode(p0)
    g.addWire(new Wire(uv0.getOutSockets()[0], p0.getInSockets()[0]))


    const t0 = new TextureInputNode("t0", img)
    g.addNode(t0)
    const st0 = new SampleTextureNode("st0")
    g.addNode(st0)

    g.addWire(new Wire(t0.getOutSockets()[0], st0.getInSockets()[0]))
    g.addWire(new Wire(uv0.getOutSockets()[0], st0.getInSockets()[1]))

    const a1 = new AddNode("a1", ShaderDataType.Vector4)
    g.addNode(a1)
    g.addWire(new Wire(p0.getOutSockets()[0], a1.getInSockets()[0]))
    g.addWire(new Wire(st0.getOutSockets()[0], a1.getInSockets()[1]))

    const o0 = new ColorOutputNode("o0")
    g.addNode(o0)
    g.addWire(new Wire(a1.getOutSockets()[0], o0.getInSockets()[0]))

    console.log(g.generateVertCode())
    console.log(g.generateFragCode())
    const m2 = new ShaderGraphMaterial(g)
    const torus = new Thing(new TorusGeometry(0.5, 50, 100))
    torus.setMaterial(m2)
    renderer.addThing(torus)
  }

  process()
  async function process () {
    stats.begin()
    /*
    torus.setPosition(new Vector3(Math.sin(Date.now() / 1000) * 2, 0, 0))
    torus.setRotation(torus.getRotation().add(new Vector3(0, 0.01, 0)))
    torus.setScale(new Vector3(1 + 0.1 * Math.sin((20 * performance.now() / 1000) % 5) * Math.pow(Math.E, - (performance.now() / 1000) % 5), 1, 1))
    */
    light.setDirection(new Vector3(Math.sin(10 * performance.now() / 1000), -1, 1))
    renderer.render(camera)
    stats.end()
    requestAnimationFrame(process)
  }
}