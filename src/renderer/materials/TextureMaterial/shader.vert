precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uMvpMatrix;
varying vec3 vNormal;
varying vec2 vUV;

void main() {
  gl_Position = uMvpMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal;
  vUV = aUV;
}