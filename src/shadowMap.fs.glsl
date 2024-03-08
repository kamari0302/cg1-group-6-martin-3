#version 300 es
precision highp float;

void main(void) {
    //if (gl_FragCoord.z > 0.5)
        gl_FragDepth = gl_FragCoord.z;
    //else
     //   return;
}
