<template>
  <div class="flex flex-col justify-center items-center">
    <div class="camera-wrapper" :class="{
'border-blue-400': !readyToCapture && !imageCaptured,
      'border-green-500': readyToCapture || imageCaptured,
    }">
      <video ref="video" autoplay playsinline v-if="!imageCaptured && cameraActive" class="camera-video" />
      <img v-if="imageCaptured" :src="capturedImage" alt="Captured Face" class="camera-image" />
      <canvas ref="canvas" class="hidden"></canvas>

      <div class="center-guide" v-if="!imageCaptured">
        <div class="crosshair"></div>
        <div class="distance-ring" :class="{ 'ring-green': readyToCapture }"></div>
        <div class="axis-line x-axis"></div>
        <div class="axis-line y-axis"></div>
      </div>
    </div>

    <div class="status-indicators mt-1 text-center">
      <div>
        <span class="font-medium">Faces: </span>
        <span :class="{
          'text-red-500': faceCount !== 1,
          'text-green-500': faceCount === 1
        }">
          {{ faceCount }}
          <span v-if="faceCount === 0">❌ (No face)</span>
          <span v-else-if="faceCount === 1">✅</span>
          <span v-else>❌ (Only one allowed)</span>
        </span>
      </div>

      <div v-if="faceCount === 1">
        <span class="font-medium">Position: </span>
        <span :class="{
          'text-red-500': !isNoseCentered,
          'text-green-500': isNoseCentered
        }">
          {{ nosePositionStatus }}
        </span>
      </div>

      <div v-if="faceCount === 1">
        <span class="font-medium">Distance: </span>
        <span :class="{
          'text-red-500': distanceScore < 65,
          'text-yellow-500': distanceScore >= 65 && distanceScore < 80,
          'text-green-500': distanceScore >= 80
        }">
          {{ distanceScore.toFixed(0) }}%
          <span v-if="distanceScore >= 65 && distanceScore < 80">👌 (Good distance)</span>
          <span v-else-if="distanceScore >= 80">👍 (Perfect)</span>
          <span v-else>👎 (Move to ~1ft distance)</span>
        </span>
      </div>

      <div v-if="showMultipleFacesWarning" class="mt-2 p-2 bg-red-100 text-red-800 rounded">
        ⚠️ Multiple faces detected! Only one face can be captured.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import * as faceapi from 'face-api.js'

const emit = defineEmits(['captured'])

// Refs
const video = ref(null)
const canvas = ref(null)
const capturedImage = ref(null)
const imageCaptured = ref(false)
const cameraActive = ref(true)
const isNoseCentered = ref(false)
const faceCount = ref(0)
const distanceScore = ref(0)
const showMultipleFacesWarning = ref(false)

// Constants
const CENTER_TOLERANCE = 15 // pixels
const IDEAL_FACE_WIDTH_PERCENT = 0.4 // 40% of frame at 1ft
const MIN_FACE_WIDTH_PERCENT = 0.25  // 25% of frame (too far)
const MAX_FACE_WIDTH_PERCENT = 0.6   // 60% of frame (too close)
let mediaStream = null
let detectionInterval = null
let warningTimeout = null

// Load face detection models
const loadModels = async () => {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68')
  } catch (error) {
    console.error('Failed to load models:', error)
  }
}

// Face detection logic
const detectFaces = async () => {
  if (!video.value || imageCaptured.value) return

  try {
    const detections = await faceapi
      .detectAllFaces(video.value, new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.6
      }))
      .withFaceLandmarks()

    faceCount.value = detections.length

    // Handle multiple faces
    if (detections.length > 1) {
      isNoseCentered.value = false
      distanceScore.value = 0
      showMultipleFacesWarning.value = true
      if (warningTimeout) clearTimeout(warningTimeout)
      warningTimeout = setTimeout(() => {
        showMultipleFacesWarning.value = false
      }, 5000)
      return
    }

    showMultipleFacesWarning.value = false

    // No face or exactly one face
    if (detections.length !== 1) {
      isNoseCentered.value = false
      distanceScore.value = 0
      return
    }

    // Calculate face metrics
    const detection = detections[0]
    const nose = detection.landmarks.getNose()[3]
    const jaw = detection.landmarks.getJawOutline()
    const videoRect = video.value.getBoundingClientRect()
    const scaleX = video.value.videoWidth / videoRect.width
    const scaleY = video.value.videoHeight / videoRect.height

    // Nose position
    const nosePosition = {
      x: nose.x / scaleX,
      y: nose.y / scaleY
    }

    // Face width calculation
    const faceWidth = Math.abs(jaw[0].x - jaw[jaw.length - 1].x) / scaleX
    const faceWidthPercent = faceWidth / videoRect.width

    // Center calculations
    const center = { 
      x: videoRect.width / 2, 
      y: videoRect.height / 2 
    }
    const distToCenter = Math.hypot(nosePosition.x - center.x, nosePosition.y - center.y)
    isNoseCentered.value = distToCenter <= CENTER_TOLERANCE

    // Distance score calculation (1ft = ~75%)
    if (faceWidthPercent < IDEAL_FACE_WIDTH_PERCENT) {
      distanceScore.value = (faceWidthPercent - MIN_FACE_WIDTH_PERCENT) / 
                          (IDEAL_FACE_WIDTH_PERCENT - MIN_FACE_WIDTH_PERCENT) * 75
    } else {
      distanceScore.value = 100 - ((faceWidthPercent - IDEAL_FACE_WIDTH_PERCENT) / 
                                (MAX_FACE_WIDTH_PERCENT - IDEAL_FACE_WIDTH_PERCENT) * 25)
    }
    distanceScore.value = Math.min(100, Math.max(0, distanceScore.value))

    // Auto-capture when conditions are perfect
    if (readyToCapture.value && !imageCaptured.value) {
      captureImage()
    }
  } catch (error) {
    console.error('Face detection error:', error)
  }
}

const captureImage = () => {
  try {
    const ctx = canvas.value.getContext('2d')
    canvas.value.width = video.value.videoWidth
    canvas.value.height = video.value.videoHeight
    ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)
    capturedImage.value = canvas.value.toDataURL('image/jpeg', 0.9)
    emit('captured', capturedImage.value)
    imageCaptured.value = true
    stopCamera()
  } catch (error) {
    console.error('Image capture error:', error)
  }
}

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    cameraActive.value = false
  }
  if (detectionInterval) {
    clearInterval(detectionInterval)
    detectionInterval = null
  }
}

// Computed properties
const readyToCapture = computed(() => {
  return faceCount.value === 1 && 
         isNoseCentered.value && 
         distanceScore.value >= 65 &&
         distanceScore.value <= 85
})

const nosePositionStatus = computed(() => {
  if (imageCaptured.value) return 'Captured!'
  return isNoseCentered.value ? 'Centered' : 'Off center'
})

// Initialize camera
onMounted(async () => {
  await loadModels()
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 300 },
        height: { ideal: 300 },
        facingMode: 'user'
      }
    })
    video.value.srcObject = mediaStream
    video.value.onloadedmetadata = () => {
      video.value.play().catch(e => console.error('Video play error:', e))
      detectionInterval = setInterval(detectFaces, 300)
    }
  } catch (err) {
    console.error('Camera error:', err)
    alert('Camera access denied. Please enable camera permissions.')
  }
})

// Cleanup
onUnmounted(() => {
  stopCamera()
  if (warningTimeout) clearTimeout(warningTimeout)
})
</script>

<style scoped>
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
  background: rgba(0, 0, 0, 0.05);
  padding: 1%;
  border-radius: 8px;
}
</style>