precision mediump float;

uniform mat4 uMiMatrix;
uniform vec4 uColor;
uniform vec4 uDirectionalLights[3];
varying vec3 vNormal;

vec3 ambientLight = vec3(0.3, 0.3, 0.3);

void main() {
  float diffuse = 0.;
  for (int i = 0; i < 3; i++) {
    vec3 invLight = normalize(uMiMatrix * (vec4(uDirectionalLights[i].xyz, 0.))).xyz;
    diffuse += max(dot(vNormal, invLight), 0.0);
  }
  gl_FragColor = uColor * (vec4(vec3(diffuse), 1.0) + vec4(ambientLight, 1.0));
}