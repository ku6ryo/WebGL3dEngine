precision mediump float;

uniform mat4 uMiMatrix;
uniform vec3 uEyeDirection;
uniform vec4 uDirectionalLights[3];
uniform sampler2D uLightColorMap;

varying vec3 vNormal;

void main() {
  vec3 destColor = vec3(0.);
  for (int i = 0; i < 3; i++) {
    vec3 diLight = normalize(uDirectionalLights[i].xyz);
    vec3 invLight = normalize(uMiMatrix * vec4(diLight, 0.0)).xyz;
    vec3 invEye = normalize(uMiMatrix * vec4(uEyeDirection, 0.0)).xyz;
    vec3 halfLE = normalize(invLight + invEye);
    float specular = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 50.0);

    float u = dot(vNormal, invEye);
    float v = dot(vNormal, -diLight);
    vec3 color = texture2D(uLightColorMap, vec2(u, v)).rgb;

    destColor += color + vec3(specular);
  }
  gl_FragColor = vec4(destColor, 0.5);
}