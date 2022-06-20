float PI = 3.141592653589793238;

uniform float time;
uniform float progress;
// uniform sampler2D texture1;
uniform sampler2D canvas;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying float vScale;

void main()	{
	vec4 videoTexture = texture2D(canvas, vUv);
	if(step(vUv.x, progress) > 0.5) discard;
	gl_FragColor = vec4(vec3(videoTexture), 1.0);
}