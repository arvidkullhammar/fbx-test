import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

const scene = new THREE.Scene() // Create a new scene
scene.background = new THREE.Color(0xf0f0f0) // Set the background color to a light grey

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
) // Create a new perspective camera

const renderer = new THREE.WebGLRenderer({ antialias: true }) // Create a new WebGL renderer
renderer.setSize(window.innerWidth, window.innerHeight) // Set the size of the renderer to fill the window
document.body.appendChild(renderer.domElement) // Append the renderer to the DOM

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040) // Soft white light
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(1, 1, 1).normalize()
scene.add(directionalLight)

camera.position.z = 5 // Position the camera

const fbxLoader = new FBXLoader()
fbxLoader.load(
  'assets/BirchTree_1.fbx',
  (treeModel) => {
    //fixTheTree(treeModel)
    console.log(treeModel)

    treeModel.scale.set(0.01, 0.01, 0.01) // Adjust scale as needed

    scene.add(treeModel)
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.error('An error occurred while loading the FBX file:', error)
  }
)

function animate() {
  requestAnimationFrame(animate) // Request the next frame

  renderer.render(scene, camera) // Render the scene from the perspective of the camera
}

function fixTheTree(treeModel) {
  treeModel.traverse((child) => {
    if (child.isMesh) {
      treeModel.traverse((child) => {
        if (child.isMesh) {
          console.log('child', child)
          child.material.map((material, i) => {
            child.castShadow = true
            if (i === 2 || i === 3) {
              material.color.setRGB(0, 0.5, 0)
            }
            if (i === 0) {
              material.color.setRGB(0.8, 0.8, 0.8)
            }
          })
        }
      })
    } else {
      console.log('non mesh', child)
    }
  })
}

animate() // Start the animation loop

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight // Adjust the camera's aspect ratio
  camera.updateProjectionMatrix() // Update the camera's projection matrix

  renderer.setSize(window.innerWidth, window.innerHeight) // Adjust the size of the renderer
})
