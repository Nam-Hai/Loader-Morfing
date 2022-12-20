const shader = /*glsl*/`#version 300 es
precision highp float;

uniform sampler2D tMap;

in vec2 vUv;

out vec4 FragColor;

void main() {
  // vec4 texture = texture(tMap,vUv);
  FragColor.rgb = vec3(0.23, 0.87,1.);
  FragColor.a = 1.;
}
`

export default shader
