import { Material } from '../Material';
import { getProgram } from './SoapBubbleProgram';

export class SoapBubbleMaterial extends Material {
  useTransparency(): boolean {
    return true;
  }

  getProgramForRender(gl: WebGLRenderingContext) {
    const p = getProgram(gl);
    return p;
  }
}
