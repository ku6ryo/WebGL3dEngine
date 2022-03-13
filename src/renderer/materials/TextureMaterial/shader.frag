precision mediump float;

uniform mat4 uMiMatrix;
uniform sampler2D uTexture;
uniform vec4 uDirectionalLights[3];

varying vec3 vNormal;
varying vec2 vUV;

void main() {
  vec4 color = texture2D(uTexture, vUV);
  float diffuse = 0.;
  for (int i = 0; i < 3; i++) {
    vec3 invLight = normalize(uMiMatrix * (vec4(uDirectionalLights[i].xyz, 0.))).xyz;
    diffuse += max(dot(vNormal, invLight), 0.0);
  }
  gl_FragColor = color * vec4(vec3(diffuse), 1.0);
}