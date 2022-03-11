import { createShader, createProgram } from "./shader";
import { mat4 } from "gl-matrix"
import { Camera } from "../Camera";
import { Thing } from "../Thing";
import { DirectionalLight } from "../lights/DirectionalLight";

export class Program {
  
  #context: WebGLRenderingContext
  #vertShader: WebGLShader
  #fragShader: WebGLShader
  #program: WebGLProgram

  // Attribute locations
  #aPositionLocation: number
  #aNormalLocation: number

  // uniform locations
  #uMvpMatrixLocation: WebGLUniformLocation
  #uMiMatrixLocation: WebGLUniformLocation
  #uDiLightsLocation: WebGLUniformLocation

  constructor(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    this.#context = gl
    this.#vertShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    this.#fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    this.#program = createProgram(gl, this.#vertShader, this.#fragShader)
    this.#uMvpMatrixLocation = this.createUniformLocation("mvpMatrix")
    this.#uMiMatrixLocation = this.createUniformLocation("miMatrix")
    this.#uDiLightsLocation = this.createUniformLocation("uDiLights")
    this.#aPositionLocation = this.createAttributeLocation("position")
    this.#aNormalLocation = this.createAttributeLocation("normal")
  }

  protected getContext() {
    return this.#context
  }
  
  // Please override this method
  prepare(camera: Camera, thing: Thing) {}

  draw(camera: Camera, thing: Thing, directionalLights: DirectionalLight[]) {
    const gl = this.#context

    gl.useProgram(this.#program);
    this.prepare(camera, thing)

    const diLights: number[] = []
    directionalLights.forEach(light => {
      const dir = light.getDirection()
      diLights.push(dir.x, dir.y, dir.z, light.getIntensity())
    })
    gl.uniform4fv(this.#uDiLightsLocation, diLights)

    const geo = thing.getGeometry()

    const mMatrix = mat4.identity(mat4.create())
    const miMatrix = mat4.identity(mat4.create())
    const mvpMatrix = mat4.identity(mat4.create());

    const pos: [number, number, number] = [thing.getPosition().x, thing.getPosition().y, thing.getPosition().z]
    mat4.translate(mMatrix, mMatrix, pos)
    const scale: [number, number, number] = [thing.getScale().x, thing.getScale().y, thing.getScale().z]
    mat4.scale(mMatrix, mMatrix, scale)

    mat4.rotateX(mMatrix, mMatrix, thing.getRotation().x)
    mat4.rotateY(mMatrix, mMatrix, thing.getRotation().y)
    mat4.rotateZ(mMatrix, mMatrix, thing.getRotation().z)

    mat4.invert(miMatrix, mMatrix)

    mat4.multiply(mvpMatrix, camera.getProjectionMatrix(), camera.getViewMatrix());
    mat4.multiply(mvpMatrix, mvpMatrix, mMatrix);

    gl.uniformMatrix4fv(this.#uMvpMatrixLocation, false, mvpMatrix);
    gl.uniformMatrix4fv(this.#uMiMatrixLocation, false, miMatrix);

    const vertices = geo.getFlatVertices()
    const normals = geo.getFlatNormals()
    const indices = geo.getIndices()

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(this.#aPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.#aPositionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(this.#aNormalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.#aNormalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  createTexture(image: HTMLCanvasElement | ImageBitmap | HTMLVideoElement | HTMLImageElement) {
    const gl = this.#context
    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  }

  createUniformLocation(name: string) {
    const location = this.#context.getUniformLocation(this.#program, name)
    if (!location) {
      throw new Error(`no uniform location: ${name}`)
    }
    return location
  }

  createAttributeLocation(name: string) {
    const location = this.#context.getAttribLocation(this.#program, name)
    return location
  }
}