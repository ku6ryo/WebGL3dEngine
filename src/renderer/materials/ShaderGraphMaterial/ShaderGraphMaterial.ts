import { BasicProgram } from "../BasicProgram";
import { Material } from "../Material";
import { Graph } from "./graph/Graph";
import { ShaderGraphProgram } from "./ShaderGaraphProgram";

export class ShaderGraphMaterial extends Material {
  #program: BasicProgram | null = null;
  #graph: Graph;

  constructor(graph: Graph) {
    super()
    this.#graph = graph
  }

  getProgramForRender(gl: WebGLRenderingContext) {
    if (this.#program) {
      return this.#program;
    }
    const program = new ShaderGraphProgram(gl, this.#graph);
    return program 
  }
}