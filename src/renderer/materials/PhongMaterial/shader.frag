precision mediump float;

uniform mat4 miMatrix;
uniform vec4 color;
uniform vec3 eyeDirection;
uniform vec4 uDiLights[3];

varying vec3 v_normal;

vec4 ambientLight = vec4(0.1, 0.1, 0.1, 1.0);

void main() {
  float diffuse = 0.;
  float specular = 0.;
  for (int i = 0; i < 3; i++) {
    vec3 invLight = normalize(miMatrix * vec4(uDiLights[i].xyz, 0.0)).xyz;
    vec3 invEye = normalize(miMatrix * vec4(eyeDirection, 0.0)).xyz;
    vec3 halfLE = normalize(invLight + invEye);
    diffuse += clamp(dot(v_normal, invLight), 0.0, 1.0);
    specular += pow(clamp(dot(v_normal, halfLE), 0.0, 1.0), 50.0);
  }
  vec4 destColor = color * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0) + ambientLight * color;
  gl_FragColor = destColor;
}