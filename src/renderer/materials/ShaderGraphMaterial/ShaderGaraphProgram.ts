import { Camera } from "../../Camera";
import { Thing } from "../../Thing";
import { BasicProgram } from "../BasicProgram"
import { Graph } from "./graph/Graph"
import { AttributeType, UniformType } from "./graph/Node";

export class ShaderGraphProgram extends BasicProgram {
  #graph: Graph;

  constructor(gl: WebGLRenderingContext, graph: Graph) {
    super(
      gl,
      graph.generateVertCode(),
      graph.generateFragCode(),
      {
        useUv: (() => {
          let useUv = false;
          graph.getNodes().forEach(node => {
            useUv = useUv || node.getAttributes().includes(AttributeType.UV)
          })
          return useUv
        })()
      }
    );
    if (!this.hasCompilationError()) {
      graph.getNodes().forEach(n => {
        n.getUniforms().forEach((u) => {
          const name = u.name
          if (!name) {
            throw new Error("Uniform name is not set")
          }
          if (u.type === UniformType.Sampler2D) {
            this.createTextureLocation(name, 0)
          } else {
            this.createUniformLocation(name)
          }
        })
      })
    }
    console.log("eeeee")
    this.#graph = graph
  }

  preDraw(_: Camera, __: Thing): void {
    this.#graph.getResolvedNodes().forEach(n => {
      n.updateOnDraw()
      n.getUniforms().forEach((u) => {
        if (!u.name) {
          throw new Error("Uniform name is not set")
        }
        if (u.type === UniformType.Sampler2D) {
          if (!u.valueSampler2D) {
            throw new Error("texture is not set")
          }
          this.setTextureValue(u.name, u.valueSampler2D)
        } else if (u.type === UniformType.Float) {
          this.setFloatUniformValue(u.name, u.valueFloat || 0)
          // TODO implement other uniforms
        }
      })
    })
  }
}