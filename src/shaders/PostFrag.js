
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

  vec4 distl = texture(tDist, vUv/coverRatio /5. -  0.1* vec2(time, time * 0.4 ));
  vec4 dists = texture(tDist, vUv/coverRatio /2. +  0.2* vec2(time, time * 0.4 ));

  // vec4 dist = texture(tDist, vUv/coverRatio);


  // vec4 texture = texture(tMap,(vUv - .5)/mix(1.,.9,progE) + 0.5 + vec2(randDir.x* (dist.r - dist.b), randDir.y *(-dist.g + dist.b)) * progE / mix(20.,15.,progE));
  vec4 texture = texture(tMap,vUv - vec2(cos(time * 2.), sin(time * 2.)) *( mix(0.1, 1. ,progE)* (distl.r - distl.g + distl.b)  * 0.02 + progE * (-dists.r + dists.g - dists.b) * 0.01));



  FragColor.rgb = texture.rgb;
  FragColor.a = texture.a;
}
`

export default shader
