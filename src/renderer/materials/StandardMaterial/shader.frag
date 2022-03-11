precision mediump float;

uniform mat4 miMatrix;
uniform vec4 color;
uniform vec4 uDiLights[3];
varying vec3 v_normal;

vec3 ambientLight = vec3(0.3, 0.3, 0.3);

void main() {
  float diffuse = 0.;
  for (int i = 0; i < 3; i++) {
    vec3 invLight = normalize(miMatrix * (vec4(uDiLights[i].xyz, 0.))).xyz;
    diffuse += max(dot(v_normal, invLight), 0.0);
  }
  gl_FragColor = color * (vec4(vec3(diffuse), 1.0) + vec4(ambientLight, 1.0));
}