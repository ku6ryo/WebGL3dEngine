import { Material } from "../Material";
import { Graph } from "./graph/Graph";
import { ShaderGraphProgram } from "./ShaderGaraphProgram";

export class ShaderGraphMaterial extends Material {
  #program: ShaderGraphProgram | null = null;
  #graph: Graph;

  #error = false

  constructor(graph: Graph) {
    super()
    this.#graph = graph
  }

  getProgramForRender(gl: WebGLRenderingContext) {
    if (this.#program) {
      return this.#program;
    }
    if (this.#error) {
      throw new Error("no program")
    }
    try {
      const program = new ShaderGraphProgram(gl, this.#graph);
      this.#program = program;
      return program 
    } catch (e) {
      this.#error = true
      throw new Error("no program")
    }
  }
}