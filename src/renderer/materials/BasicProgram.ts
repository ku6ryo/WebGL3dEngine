import { mat4 } from "gl-matrix"
import { Camera } from "../Camera";
import { Thing } from "../Thing";
import { DirectionalLight } from "../lights/DirectionalLight";
import { Program } from "./Program";

enum BasicProgramUniform {
  MVP_MATRIX = "uMvpMatrix",
  MI_MATRIX = "uMiMatrix",
  DIRECTIONAL_LIGHTS = "uDirectionalLights",
}

enum BasicProgramAttribute {
  POSITION = "aPosition",
  NORMAL = "aNormal",
  UV = "aUV",
}

type BasicProgramOptions = {
  useUv?: boolean,
}

export class BasicProgram extends Program {

  #options: BasicProgramOptions

  constructor(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string, options: BasicProgramOptions = {}) {
    super(gl, vertexShaderSource, fragmentShaderSource)
    this.createUniformLocation(BasicProgramUniform.MVP_MATRIX)
    this.createUniformLocation(BasicProgramUniform.MI_MATRIX)
    this.createUniformLocation(BasicProgramUniform.DIRECTIONAL_LIGHTS)
    this.createAttributeLocation(BasicProgramAttribute.POSITION)
    this.createAttributeLocation(BasicProgramAttribute.NORMAL)

    this.#options = options
    if (options.useUv) {
      this.createAttributeLocation(BasicProgramAttribute.UV)
    }
  }
  
  // Please override this method
  preDraw(camera: Camera, thing: Thing) {}

  draw(camera: Camera, thing: Thing, directionalLights: DirectionalLight[]) {
    super.draw(camera, thing, directionalLights)
    const gl = this.getContext()

    const diLights: number[] = []
    directionalLights.forEach(light => {
      const dir = light.getDirection()
      diLights.push(dir.x, dir.y, dir.z, light.getIntensity())
    })
    gl.uniform4fv(this.getUniformLocation(BasicProgramUniform.DIRECTIONAL_LIGHTS), diLights)

    const geo = thing.getGeometry()

    const mMatrix = mat4.identity(mat4.create())
    const uMiMatrix = mat4.identity(mat4.create())
    const uMvpMatrix = mat4.identity(mat4.create());

    const pos: [number, number, number] = [thing.getPosition().x, thing.getPosition().y, thing.getPosition().z]
    mat4.translate(mMatrix, mMatrix, pos)
    const scale: [number, number, number] = [thing.getScale().x, thing.getScale().y, thing.getScale().z]
    mat4.scale(mMatrix, mMatrix, scale)

    mat4.rotateX(mMatrix, mMatrix, thing.getRotation().x)
    mat4.rotateY(mMatrix, mMatrix, thing.getRotation().y)
    mat4.rotateZ(mMatrix, mMatrix, thing.getRotation().z)

    mat4.invert(uMiMatrix, mMatrix)

    mat4.multiply(uMvpMatrix, camera.getProjectionMatrix(), camera.getViewMatrix());
    mat4.multiply(uMvpMatrix, uMvpMatrix, mMatrix);

    gl.uniformMatrix4fv(this.getUniformLocation(BasicProgramUniform.MVP_MATRIX), false, uMvpMatrix);
    gl.uniformMatrix4fv(this.getUniformLocation(BasicProgramUniform.MI_MATRIX), false, uMiMatrix);

    const vertices = geo.getFlatVertices()
    const normals = geo.getFlatNormals()
    const indices = geo.getIndices()

    const posLoc = this.getAttributeLocation(BasicProgramAttribute.POSITION)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const normLoc = this.getAttributeLocation(BasicProgramAttribute.NORMAL)
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    if (this.#options.useUv) {
      const uvs = geo.getFlatUVs()
      const uvLoc = this.getAttributeLocation(BasicProgramAttribute.UV)
      const uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(uvLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }
}