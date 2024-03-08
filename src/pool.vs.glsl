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

void main() {
    vColor = color;
    gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);
    vec3 n = normalize(uNormal * aNormal); // Verwenden von aNormalAttrib
    vIntensity = abs(n.z);
}
