
<template>
  <div class="flex flex-col justify-center items-center">
    <div class="camera-wrapper" :class="{
      'border-blue-400': !readyToCapture && !imageCaptured,
      'border-green-500': readyToCapture || imageCaptured,
    }">
      <!-- Loading text shown when camera is not active -->
      <div v-if="!cameraReady" class="absolute inset-0 flex items-center justify-center text-gray-500">
       <LOADING/>
      </div>
      
      <video ref="video" autoplay playsinline v-show="cameraReady && !imageCaptured && cameraActive" class="camera-video" />
      <img v-if="imageCaptured" :src="capturedImage" alt="Captured Face" class="camera-image" />
      <canvas ref="canvas" class="hidden"></canvas>

      <!-- Visual guides -->
      <div class="center-guide" v-if="!imageCaptured && cameraReady">
        <div class="crosshair"></div>
        <div class="distance-ring" :class="{ 'ring-green': readyToCapture }"></div>
        <!-- Axis lines -->
        <div class="axis-line x-axis"></div>
        <div class="axis-line y-axis"></div>
      </div>
    </div>

    <!-- Status indicators -->
    <div class="status-indicators mt-1 w-full text-center flex justify-center gap-2 bg-yellow-100" v-if="cameraReady">
      <div>
        <span class="font-medium">Position: </span>
        <span :class="{
          'text-red-500': !isFaceCentered && !imageCaptured,
          'text-yellow-500': isFaceCentered && faceDistanceScore < 70 && !imageCaptured,
          'text-green-500': readyToCapture || imageCaptured
        }">
          {{ facePositionStatus }}
        </span>
      </div>

      <div>
        <span class="font-medium">Distance: </span>
        <span :class="{'text-red-500': faceDistanceScore < 70 && !imageCaptured, 'text-green-500': faceDistanceScore >= 70 || imageCaptured}">
          {{ faceDistanceScore.toFixed(0) }}%
        </span>
        <span v-if="faceDistanceScore >= 70 || imageCaptured">✅</span>
      </div>
    </div>

  
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as faceapi from 'face-api.js'
import LOADING from '@/components/googlebouncing.vue'

const emit = defineEmits(['captured'])

const video = ref(null)
const canvas = ref(null)
const capturedImage = ref(null)
const imageCaptured = ref(false)
const cameraActive = ref(true)
const cameraReady = ref(false) 
const faceDistanceScore = ref(0)
const isFaceCentered = ref(false)
const faceDetected = ref(false)
const multipleFacesDetected = ref(false)

let mediaStream = null
let alertShown = false

// Frame settings
const FRAME_SIZE = 300
const CENTER_TOLERANCE = 20
const MIN_DISTANCE_SCORE = 70



const startCamera = async () => {
  try {
    cameraActive.value = true
    cameraReady.value = false // Show loading text initially
    
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        facingMode: 'user'
      }
    })
    
    video.value.srcObject = mediaStream
    
    // Wait for video to be ready to play
    video.value.onloadedmetadata = () => {
      cameraReady.value = true // Hide loading text and show video
      startDetectionLoop()
    }
    
  } catch (err) {
    emit('error', { message: 'Could not access camera: ' + err.message })
    cameraReady.value = false
  }
}
const loadModels = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector')
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68')
}

const distance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y)

const detectFaces = async () => {
  if (!video.value || video.value.readyState !== 4 || imageCaptured.value) return

  const detections = await faceapi
    .detectAllFaces(video.value, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()

  // Handle multiple faces
  if (detections.length > 1) {
    faceDetected.value = false
    isFaceCentered.value = false
    faceDistanceScore.value = 0
    multipleFacesDetected.value = true

    if (!alertShown) {
      alert('❌ Multiple faces detected. Please ensure only one face is visible.')
      alertShown = true
      setTimeout(() => { alertShown = false }, 3000)
    }
    return
  }

  multipleFacesDetected.value = false

  // No face detected
  if (detections.length === 0) {
    faceDetected.value = false
    isFaceCentered.value = false
    faceDistanceScore.value = 0
    return
  }

  faceDetected.value = true
  const detection = detections[0]
  const landmarks = detection.landmarks
  const nose = landmarks.getNose()[3]

  // Calculate position
  const videoRect = video.value.getBoundingClientRect()
  const scaleX = video.value.videoWidth / videoRect.width
  const scaleY = video.value.videoHeight / videoRect.height

  const nosePosition = {
    x: nose.x / scaleX,
    y: nose.y / scaleY
  }

  // Calculate distance from center
  const center = { x: FRAME_SIZE / 2, y: FRAME_SIZE / 2 }
  const distToCenter = distance(nosePosition, center)

  // Calculate score (100% when perfectly centered)
  const maxDistance = FRAME_SIZE / 2
  faceDistanceScore.value = Math.max(0, 100 - (distToCenter / maxDistance) * 100)

  // Check if face is centered enough
  isFaceCentered.value = distToCenter <= CENTER_TOLERANCE

  // Auto-capture when conditions are met
  if (readyToCapture.value && !imageCaptured.value) {
    captureImage()
  }
}

const captureImage = () => {
  const ctx = canvas.value.getContext('2d')
  canvas.value.width = video.value.videoWidth
  canvas.value.height = video.value.videoHeight
  ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)
  capturedImage.value = canvas.value.toDataURL('image/png')
  emit('captured', capturedImage.value)
  imageCaptured.value = true
  stopCamera()
}

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    cameraActive.value = false
  }
}

const startDetectionLoop = () => {
  const loop = async () => {
    await detectFaces()
    requestAnimationFrame(loop)
  }
  loop()
}

// Computed properties
const readyToCapture = computed(() => {
  return faceDetected.value &&
    isFaceCentered.value &&
    faceDistanceScore.value >= MIN_DISTANCE_SCORE
})

const facePositionStatus = computed(() => {
  if (imageCaptured.value) return 'Captured!'
  if (!faceDetected.value) return 'No face'
  if (!isFaceCentered.value) return 'Off center'
  if (faceDistanceScore.value < MIN_DISTANCE_SCORE) return 'Too far'
  return 'Perfect!'
})

onMounted(async () => {
  await loadModels()
  startCamera()
})
</script>

<style scoped>
/* Previous styles remain the same */
.camera-wrapper {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease;
}

.camera-wrapper.border-blue-400 {
  border-color: #60a5fa;
}

.camera-wrapper.border-green-500 {
  border-color: #10b981;
}

.camera-video,
.camera-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.center-guide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  z-index: 2;
}

.crosshair:before,
.crosshair:after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
}

.crosshair:before {
  width: 2px;
  height: 20px;
  left: 9px;
  top: 0;
}

.crosshair:after {
  width: 20px;
  height: 2px;
  left: 0;
  top: 9px;
}

.distance-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px dashed rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transition: border-color 0.3s ease;
  z-index: 1;
}

.distance-ring.ring-green {
  border-color: rgba(0, 255, 0, 0.7);
}

/* Axis lines */
.axis-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  pointer-events: none;
}

.x-axis {
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  transform: translateY(-50%);
}

.y-axis {
  left: 50%;
  top: 0;
  height: 100%;
  width: 1px;
  transform: translateX(-50%);
}

.status-indicators {
  min-width: 250px;
 
  padding: 1%;
  border-radius: 8px;
}

.instructions p {
  margin: 0.3rem 0;
  padding: 0.2rem;
  border-radius: 4px;
}
</style>