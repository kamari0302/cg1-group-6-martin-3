#version 300 es
precision highp float;

in float vIntensity;
uniform vec3 uColor;

in vec3 vColor;
out vec4 fColor;

void main() {
     //fColor = vec4(vIntensity*uColor.r,vIntensity*uColor.g,vIntensity*uColor.b,1.0);
     //fColor = vec4(0.1,1.0,0.0, 1.0);
     vec3 nColor = normalize(vColor);
     fColor = vec4(nColor, 1.0);
}
