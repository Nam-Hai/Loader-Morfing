
const shader = /*glsl*/`#version 300 es
precision highp float;

uniform sampler2D tMap;
uniform sampler2D tDist;
uniform float time;
uniform float progE;
uniform vec2 coverRatio;
uniform vec2 randDir;

in vec2 vUv;

out vec4 FragColor;

void main() {

  // the normal map is loaded two time with different zoom and translation
  vec4 distl = texture(tDist, vUv/coverRatio /6. -  0.1* vec2(time, time * 0.4 ));
  vec4 dists = texture(tDist, vUv/coverRatio /2. +  0.2* vec2(time * 1., -time * .8 ) + 2545.6);
  vec4 distxs = texture(tDist, vUv/coverRatio /1. +  0.3* vec2(cos(time) , sin(time)) + 24.1);

  vec2 largeDisplacment = vec2(cos(time * 2.), sin(time * 2.)) *mix(0.1, 1. ,progE)* (- distl.g + distl.b)  * 0.02;
  vec2 smallDisplacment = vec2(cos(time*2.), sin(time* 2.)) *progE * (dists.r + dists.g -4. * dists.b) * 0.003;

  vec2 smallDisplacmentNormal = vec2(cos(time*2.), sin(time* 2.)) *mix(0.1, 1., progE) * (-2. *distxs.r ) * 0.0005;
  // I've tried with some normal movement but I not sure of the feeling
  // vec2 smallDisplacmentNormal = vec2(-sin(time*2.), cos(time* 2.)) *mix(0.1, 1., progE) * (-2. *distxs.r ) * 0.001;


  vec4 texture = texture(tMap,vUv -  largeDisplacment + smallDisplacment + smallDisplacmentNormal);

  FragColor.rgb = texture.rgb;
  FragColor.a = texture.a;
}
`

export default shader
