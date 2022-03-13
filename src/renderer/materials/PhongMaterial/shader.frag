precision mediump float;

uniform mat4 uMiMatrix;
uniform vec3 uEyeDirection;
uniform vec4 uColor;
uniform vec4 uDirectionalLights[3];

varying vec3 vNormal;

vec4 ambientLight = vec4(0.1, 0.1, 0.1, 1.0);

void main() {
  float diffuse = 0.;
  float specular = 0.;
  for (int i = 0; i < 3; i++) {
    vec3 invLight = normalize(uMiMatrix * vec4(uDirectionalLights[i].xyz, 0.0)).xyz;
    vec3 invEye = normalize(uMiMatrix * vec4(uEyeDirection, 0.0)).xyz;
    vec3 halfLE = normalize(invLight + invEye);
    diffuse += clamp(dot(vNormal, invLight), 0.0, 1.0);
    specular += pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 50.0);
  }
  vec4 destColor = uColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0) + ambientLight * uColor;
  gl_FragColor = destColor;
}