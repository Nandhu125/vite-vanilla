precision mediump float;

uniform sampler2D u_texture;  // Video texture
uniform float u_time;         // Time variable to animate effects

varying vec2 v_uv;  // Texture coordinates from vertex shader

void main() {
  // Sample the video texture
  vec4 videoColor = texture2D(u_texture, v_uv);
  
  // Simple color effect: apply a sine wave for animation
  float sineWave = sin(u_time + v_uv.x * 10.0) * 0.5 + 0.5;
  
  // Apply the sine wave effect to the red channel of the video texture
  videoColor.r *= sineWave;
  
  // Output the final color
  gl_FragColor = videoColor;
} 