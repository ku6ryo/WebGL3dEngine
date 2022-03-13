precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uMvpMatrix;
varying vec3 vNormal;

void main() {
   gl_Position = uMvpMatrix * vec4(aPosition, 1.0);
   vNormal = aNormal;
}