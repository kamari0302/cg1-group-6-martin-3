#version 300 es
precision highp float;

in float vIntensity;
uniform vec3 uColor;
in vec3 vColor;
out vec4 fColor;
uniform vec3 uCameraPos; // position of the camera in world coordinates
in vec4 vLposition; // position of a fragment in normalized light coordinates [-1,1]^3
in vec3 vPosition;  // position of a fragment in world coordinates
in vec3 vNormal;    // normal of a fragment in world coordinates
uniform sampler2D uShadowMap; // shadow map texture

//float phong() {
   //vec3 N = normalize(vNormal);

  // vec3 L;
  // L = normalize(vPosition - uLightPos);

 //  vec3 V = normalize(vPosition - uCameraPos);
 //float att = attenuation();

    // diffuse light 
  // float Id = max(dot(N, -L), 0.0f) ;

    // specular light
  // vec3 H = normalize(L + V);
  // float Is = pow(max(dot(N, -H), 0.0f), 12. * 2.0f);

    // lighten up the diffuse shadow compared to the specular shadow 
    // give that look of global illumination or scattered light
 // return (Id + Is) * att;}

float shadow() {
    vec2 texelSize = 1.0f / vec2(textureSize(uShadowMap, 0));

    vec3 projectionCoords = 0.5f * (vLposition.xyz / vLposition.w) + 0.5f;
    float shadowValue = 0.0;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            shadowValue += projectionCoords.z - 0.005 > texture(uShadowMap, vec2(projectionCoords.x+float(i)*texelSize.x,projectionCoords.y+float(j)*texelSize.y)).r ? 0.0f : 1.0f;
        }
    }
    return shadowValue/9.0;
}




void main() {
     //fColor = vec4(vIntensity*uColor.r,vIntensity*uColor.g,vIntensity*uColor.b,1.0);
     //fColor = vec4(0.1,1.0,0.0, 1.0);
     vec3 nColor = normalize(vColor);
     fColor = vec4(nColor, 1.0);
}
