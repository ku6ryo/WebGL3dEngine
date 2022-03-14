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
import { SocketType } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/Socket";
import { Vector4InputNode } from "./renderer/materials/ShaderGraphMaterial/graph/nodes/inputs/Vector4InputNode";
import { Vector4 } from "./renderer/math/Vector4";

const stats = new Stats()
document.body.appendChild(stats.dom)

main()

async function main() {
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

  const box = new Thing(new BoxGeometry())
  renderer.addThing(box)

  const light = new DirectionalLight(new Vector3(0, -1, 1), 1)
  renderer.addDirectionalLight(light)
  renderer.addDirectionalLight(new DirectionalLight(new Vector3(1, 1, 1), 1))

  const img = new Image()
  img.src = sampleTexUrl
  img.onload = () => {
    const plane = new Thing(new PlaneGeometry())
    const m = new TextureMaterial()
    m.setTexture(img)
    plane.setMaterial(m)
    plane.setPosition(new Vector3(-1, 0, 0))
    renderer.addThing(plane)
  }

  const torus = new Thing(new TorusGeometry(0.5, 100, 200))
  // const tMat = new PhongMaterial()
  const tMat = new SoapBubbleMaterial()
  torus.setMaterial(tMat)
  renderer.addThing(torus)

  const g = new Graph()
  const f0 = new FloatInputNode("f0")
  f0.setValue(0.3)
  const v1 = new Vector4InputNode("v1")
  v1.setValue(new Vector4(1, 0, 0, 1))
  const a0 = new AddNode("a0", SocketType.Vector4)
  const o0  = new ColorOutputNode("o0")
  g.addNode(f0)
  g.addNode(v1)
  g.addNode(a0)
  g.addNode(o0)
  g.addWire(new Wire(f0.getOutSockets()[0], a0.getInSockets()[0]))
  g.addWire(new Wire(v1.getOutSockets()[0], a0.getInSockets()[1]))
  g.addWire(new Wire(a0.getOutSockets()[0], o0.getInSockets()[0]))
  console.log(g.generateFragCode())
  const m2 = new ShaderGraphMaterial(g)
  const plane = new Thing(new PlaneGeometry())
  plane.setMaterial(m2)
  plane.setPosition(new Vector3(1, 0, 0))
  renderer.addThing(plane)

  process()
  async function process () {
    stats.begin()
    torus.setPosition(new Vector3(Math.sin(Date.now() / 1000) * 2, 0, 0))
    torus.setRotation(torus.getRotation().add(new Vector3(0, 0.01, 0)))
    torus.setScale(new Vector3(1 + 0.1 * Math.sin((20 * performance.now() / 1000) % 5) * Math.pow(Math.E, - (performance.now() / 1000) % 5), 1, 1))
    light.setDirection(new Vector3(Math.sin(10 * performance.now() / 1000), -1, 1))
    renderer.render(camera)
    stats.end()
    requestAnimationFrame(process)
  }
}