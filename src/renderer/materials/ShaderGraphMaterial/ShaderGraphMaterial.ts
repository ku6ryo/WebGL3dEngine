import { Material } from "../Material";
import { ShaderGraph } from "./graph/ShaderGraph";
import { ShaderGraphProgram } from "./ShaderGaraphProgram";

export class ShaderGraphMaterial extends Material {
  #program: ShaderGraphProgram | null = null;
  #graph: ShaderGraph;

  #error = false

  constructor(graph: ShaderGraph) {
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