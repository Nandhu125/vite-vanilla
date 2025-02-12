import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import gsap from 'gsap';

// Get the container element
const container = document.getElementById('video-container');

// Set container style for proper video fitting
container.style.width = '100%';
container.style.height = '100vh';
container.style.overflow = 'hidden';
container.style.transformOrigin = 'center center';

// Add GSAP animations
function animateContainer() {
  // Timeline for sequence of animations
  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true
  });

  // Add animations to timeline
  tl.to(container, {
    duration: 2,
    scale: 0.9,
    rotation: 5,
    ease: "power2.inOut"
  })
  .to(container, {
    duration: 2,
    scale: 1.1,
    rotation: -5,
    ease: "power2.inOut"
  })
  .to(container, {
    duration: 1.5,
    scale: 1,
    rotation: 0,
    ease: "elastic.out(1, 0.3)"
  });
}

// Start the animation
animateContainer();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000,
);

// Set camera position for better view of the video plane
camera.position.set(0, 0, 1);

// Create video element
const video = document.createElement('video');
video.src = '/desktop.mp4';
video.loop = true;
video.muted = true;
video.crossOrigin = 'anonymous';
video.playsInline = true;
video.autoplay = true;

// Add error handling for video
video.onerror = function(e) {
  console.error('Error loading video:', e);
};

// Create video texture
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

// Define shaders
const vertexShader = `
  varying vec2 v_uv;
  
  void main() {
      v_uv = uv;
      gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D u_texture;
  uniform float u_time;
  varying vec2 v_uv;
  
  void main() {
      vec4 videoColor = texture2D(u_texture, v_uv);
      float sineWave = sin(u_time + v_uv.x * 10.0) * 0.5 + 0.5;
      videoColor.r *= sineWave;
      gl_FragColor = videoColor;
  }
`;

// Create shader material
const videoMaterial = new THREE.ShaderMaterial({
  uniforms: {
    u_texture: { value: videoTexture },
    u_time: { value: 0.0 }
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true
});

// Create a full-screen plane
const videoPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  videoMaterial
);
scene.add(videoPlane);

const canvas = container.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ 
  canvas,
  antialias: true,
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);

// Wait for video to be loaded before playing
video.addEventListener('loadeddata', () => {
  video.play().catch(function(error) {
    console.error("Error playing video:", error);
  });
  console.log('Video loaded and playing');
});

// Handle window resize
function resizeVideoPlane() {
  const videoAspect = video.videoWidth / video.videoHeight;
  const containerAspect = container.clientWidth / container.clientHeight;
  
  if (containerAspect > videoAspect) {
    // Container is wider than video
    const scale = containerAspect / videoAspect;
    videoPlane.scale.set(scale, 1, 1);
  } else {
    // Container is taller than video
    const scale = 1 / (containerAspect / videoAspect);
    videoPlane.scale.set(1, scale, 1);
  }
}

// Handle container resize
const resizeObserver = new ResizeObserver(() => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  resizeVideoPlane();
});

resizeObserver.observe(container);

// Call resize once to set initial size
video.addEventListener('loadedmetadata', resizeVideoPlane);

// Disable OrbitControls since we don't need them for fullscreen video
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

function animate() {
  requestAnimationFrame(animate);
  
  // Update shader time uniform
  videoMaterial.uniforms.u_time.value += 0.01;
  
  // Ensure video is playing
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    videoTexture.needsUpdate = true;
  }
  
  renderer.render(scene, camera);
  // controls.update(); // Remove controls update
}

animate();
