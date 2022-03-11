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
  const bMat = new StandardMaterial()
  bMat.setColor(new Color(0, 0, 1, 1))
  box.setMaterial(bMat)
  renderer.addThing(box)

  const torus = new Thing(new TorusGeometry(0.5, 70, 100))
  const tMat = new PhongMaterial()
  tMat.setColor(new Color(1, 0, 0, 1))
  torus.setMaterial(tMat)
  torus.setPosition(new Vector3(2, 0, 0))
  torus.setScale(new Vector3(0.5, 0.5, 0.5))
  renderer.addThing(torus)

  const cone = new Thing(new ConeGeometry(100))
  const cMat = new PhongMaterial()
  cMat.setColor(new Color(0, 1, 0, 1))
  cone.setMaterial(cMat)
  cone.setPosition(new Vector3(-1, 0, 0))
  renderer.addThing(cone)

  const light = new DirectionalLight(new Vector3(-1, 0, 1), 1)
  renderer.addDirectionalLight(light)

  process()
  async function process () {
    stats.begin()

    box.setPosition(new Vector3(Math.sin(performance.now() / 1000), 0, 0))
    box.setRotation(new Vector3(performance.now() / 1000, 0, 0))

    cone.setRotation(new Vector3(performance.now() / 1000, 0, 0))

    torus.setRotation(new Vector3(- performance.now() / 1000, 0, 0))

    renderer.render(camera)

    stats.end()
    requestAnimationFrame(process)
  }
}