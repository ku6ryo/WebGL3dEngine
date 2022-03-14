import { BasicProgram } from "../BasicProgram";
import { Material } from "../Material";
import { Graph } from "./graph/Graph";

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
    this.#program = new BasicProgram(
      gl,
      this.#graph.generateVertCode(),
      this.#graph.generateFragCode()
    );
    return this.#program;
  }
}