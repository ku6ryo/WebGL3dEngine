import vertexShaderSource from './shader.vert';
import fragmentShaderSource from './shader.frag';
import { Color } from '../../math/Color';
import { Camera } from '../../Camera';
import { Thing } from '../../Thing';
import { BasicProgram } from '../BasicProgram';

let program: TextureProgram | null = null;

export function getProgram(context: WebGLRenderingContext) {
  if (program) {
    return program;
  }
  program = new TextureProgram(context);
  return program;
}

enum TextureProgramUniform {
  Texture = 'uTexture',
}

class TextureProgram extends BasicProgram {
  #texture: HTMLImageElement | null = null;

  constructor(context: WebGLRenderingContext) {
    super(context, vertexShaderSource, fragmentShaderSource, {
      useDirectionalLights: true,
      useModelInvertMatrix: true,
      useUv: true,
    });
    this.createTextureLocation(TextureProgramUniform.Texture, 0);
  }

  setTexture(tex: HTMLImageElement) {
    this.#texture = tex;
  }

  preDraw(_: Camera, __: Thing): void {
    if (!this.#texture) {
      return;
    }
    this.setTextureValue(TextureProgramUniform.Texture, this.#texture);
  }
}
