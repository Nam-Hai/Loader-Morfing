#version 300 es
#define PI 3.1415926535
precision highp float;

in vec2 uv;
in vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;

void main() {
  vUv = uv;
  vec4 newPos = modelViewMatrix*   vec4(position, 1.0);
  gl_Position = projectionMatrix * newPos;
}


