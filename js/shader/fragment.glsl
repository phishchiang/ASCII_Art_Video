float PI = 3.141592653589793238;

uniform float time;
uniform float progress;
// uniform sampler2D texture1;
uniform sampler2D chars;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying float vScale;

void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	float size = 20.0;

	vec2 newUV = vUv;
	newUV.x = vUv.x/size + floor(vScale * size)/size;
	vec4 charsTex = texture(chars, newUV);
	// gl_FragColor = vec4(vUv,0.0,1.);
	gl_FragColor = charsTex;
	// gl_FragColor = vec4(vScale, vScale, vScale, 1.0);
}