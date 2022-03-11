precision mediump float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 mvpMatrix;
varying vec3 v_normal;

void main() {
   gl_Position = mvpMatrix * vec4(position, 1.0);
   v_normal = normal;
}