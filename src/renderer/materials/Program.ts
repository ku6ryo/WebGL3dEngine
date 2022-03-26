import { createShader, createProgram } from './shader';
import { Camera } from '../Camera';
import { Thing } from '../Thing';
import { DirectionalLight } from '../lights/DirectionalLight';

export class Program {
  #context: WebGLRenderingContext;
  #vertShader: WebGLShader | null = null;
  #fragShader: WebGLShader | null = null;
  #program: WebGLProgram | null = null;

  #uniformLocations: { [name: string]: WebGLUniformLocation } = {};
  #textureUniformLocations: {
    [name: string]: { location: WebGLUniformLocation; index: number };
  } = {};
  #attributeLocations: { [name: string]: number } = {};

  #programConpileError: string | null = null;

  constructor(
    gl: WebGLRenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    this.#context = gl;
    try {
      this.#vertShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      this.#fragShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
      );
      this.#program = createProgram(gl, this.#vertShader, this.#fragShader);
    } catch (e) {
      this.#programConpileError = (e as Error).message;
      console.log(e);
    }
  }

  hasCompilationError() {
    return this.#programConpileError !== null;
  }

  protected getContext() {
    return this.#context;
  }

  // Please override this method
  protected preDraw(camera: Camera, thing: Thing) {}

  draw(camera: Camera, thing: Thing, directionalLights: DirectionalLight[]) {
    const gl = this.#context;
    gl.useProgram(this.#program);
    this.preDraw(camera, thing);
  }

  protected createAttributeLocation(name: string) {
    if (!this.#program) {
      throw new Error(`program is not created. Maybe compilation error?`);
    }
    const location = this.#context.getAttribLocation(this.#program, name);
    this.#attributeLocations[name] = location;
    return location;
  }

  protected getAttributeLocation(name: string) {
    const location = this.#attributeLocations[name];
    if (location === undefined) {
      throw new Error(`no atribute location: ${name}`);
    }
    return location;
  }

  protected createUniformLocation(name: string) {
    if (!this.#program) {
      throw new Error(`program is not created. Maybe compilation error?`);
    }
    const location = this.#context.getUniformLocation(this.#program, name);
    if (!location) {
      throw new Error(`Failed to create an uniform location: ${name}`);
    }
    this.#uniformLocations[name] = location;
    return location;
  }

  protected getUniformLocation(name: string) {
    const location = this.#uniformLocations[name];
    if (!location) {
      throw new Error(`no uniform location: ${name}`);
    }
    return location;
  }

  protected createTextureLocation(name: string, index: number) {
    const location = this.createUniformLocation(name);
    this.#textureUniformLocations[name] = { location, index };
  }

  protected setFloatUniformValue(name: string, value: number) {
    const location = this.getUniformLocation(name);
    const gl = this.#context;
    gl.uniform1f(location, value);
  }

  protected getTextureLocation(name: string) {
    const location = this.#textureUniformLocations[name];
    if (!location) {
      throw new Error(`No texture location: ${name}`);
    }
    return location;
  }

  protected setTextureValue(
    name: string,
    image: HTMLCanvasElement | ImageBitmap | HTMLVideoElement | HTMLImageElement
  ) {
    const location = this.getTextureLocation(name);
    const texture = this.createTexture(image);
    const gl = this.#context;
    const index = location.index;
    gl.uniform1i(location.location, index);
    gl.activeTexture((gl as any)['TEXTURE' + index]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  protected createTexture(
    image: HTMLCanvasElement | ImageBitmap | HTMLVideoElement | HTMLImageElement
  ) {
    const gl = this.#context;
    const texture = gl.createTexture();
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
}
