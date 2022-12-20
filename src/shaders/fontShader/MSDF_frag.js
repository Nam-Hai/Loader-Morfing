import { shader as noiseCommon } from '../noise-common'
import { shader as noise3d } from '../noise3d'

const shader = /*glsl*/`#version 300 es
precision highp float;
#define varying in
#define texture2D texture
#define gl_FragColor FragColor
out vec4 FragColor;
uniform sampler2D tMap;
uniform float uAlpha;
uniform vec2 coverRatio;

varying vec2 vUv;

${noiseCommon}
${noise3d}
void main() {
    vec3 tex = texture2D(tMap, vUv).rgb;
    float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
    float d = fwidth(signedDist);
    float alpha = smoothstep(-d, d, signedDist);

    if (alpha < 0.01) discard;
    vec2 uv = vUv / coverRatio;
    float noise = noise3d(vec3(vUv.x* 20., vUv.y*20., uAlpha))+ mix(-.5, 1.5, uAlpha);

    float mask = smoothstep(0.49, .5,  noise);

    gl_FragColor.rgb = vec3(0.616,0.388,0.506);
    // gl_FragColor.rgb = vec3(mask);
    gl_FragColor.a = mask;
}`

export { shader }
