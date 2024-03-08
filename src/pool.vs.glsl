#version 300 es
precision highp float;

in vec3 aNormal;

layout (location = 0) in vec3 aPosition;  
layout (location = 1) in vec3 color;
layout (location = 2) in vec3 aNormalAttrib; // Änderung des Attributnamens

uniform mat4 uModelView;
uniform mat4 uProjection;
uniform mat3 uNormal;

out vec3 vColor;
out float vIntensity;
uniform mat4 uLightViewProjection; // light view projection matrix

out vec4 vLposition; // position of a fragment in normalized light coordinates [-1,1]^3
out vec3 vPosition;  // position of a fragment in world coordinates

void main() {
    vColor = color;
    vec3 centeredPos = aPosition - vec3(0.5,0.5,0.5);
    gl_Position = uProjection * uModelView * vec4(centeredPos, 1.0);
    vec3 n = normalize(uNormal * aNormal); // Verwenden von aNormalAttrib
    vIntensity = abs(n.z);
}

