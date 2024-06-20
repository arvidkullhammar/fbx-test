import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
const scene = new THREE.Scene()
const loader = new GLTFLoader()
const fbxLoader = new FBXLoader()

const raycaster = new THREE.Raycaster()
const down = new THREE.Vector3(0, -1, 0)

let treeModel
fbxLoader.load(
  'assets/BirchTree_1.fbx',
  (treeModel) => {
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

    treeModel.scale.set(0.05, 0.05, 0.05)
    scene.add(treeModel)
    treeModel.receiveShadow = true
    treeModel.castShadow = true
    treeModel.position.y += 5
    treeModel.position.z += 10
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.error('An error occurred while loading the FBX file:', error)
  }
)
let cameraIsPanned = false

const spaceTexture = new THREE.TextureLoader().load('assets/sky.jpg')
//spaceTexture.minFilter = THREE.LinearFilter
scene.background = spaceTexture

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.y = 10
camera.position.z = 30

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

//renderer.toneMapping = THREE.ACESFilmicToneMapping
//renderer.toneMappingExposure = 1
//renderer.outputEncoding = THREE.sRGBEncoding

const light = new THREE.DirectionalLight(0xffffff)
light.position.set(-250, 400, 100)
light.target.position.set(0, 0, 0)
light.intensity = 1.5
light.castShadow = true
light.shadow.mapSize.width = 2048
light.shadow.mapSize.height = 2048
let d = 50
light.shadow.camera.left = -d
light.shadow.camera.right = d
light.shadow.camera.top = d
light.shadow.camera.bottom = -d

scene.add(light)

const ambLight = new THREE.AmbientLight(0xffffff)
scene.add(ambLight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.maxPolarAngle = Math.PI * 0.495
//controls.minDistance = 20.0
//controls.maxDistance = 200.0
controls.addEventListener('start', () => {
  cameraIsPanned = true
})

controls.update()

document.body.appendChild(renderer.domElement)

const groundSize = 250
const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 50, 50)

// Create an array to hold color values for each vertex
const colors = []

// Define the base color
const baseColor = new THREE.Color('#90EE90')
const lighterGreen = new THREE.Color('#e0ffe0')

// Load heightmap texture and modify vertex positions
const textureLoader = new THREE.TextureLoader()
let ground
textureLoader.load('assets/Heightmap.png', function (texture) {
  // Get image data from the texture
  const image = texture.image
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = image.width
  canvas.height = image.height
  context.drawImage(image, 0, 0)
  const imageData = context.getImageData(0, 0, image.width, image.height)
  const data = imageData.data

  // Modify vertices and set vertex colors
  const positions = groundGeometry.attributes.position.array
  let minZ = Infinity
  let maxZ = -Infinity

  for (let i = 0; i < positions.length; i += 3) {
    const x = (positions[i] + groundSize / 2) * (image.width / groundSize)
    const y = (positions[i + 1] + groundSize / 2) * (image.height / groundSize)
    const index = (Math.floor(y) * image.width + Math.floor(x)) * 4

    if (index < 0 || index >= data.length) {
      continue // Skip invalid indices
    }

    const heightValue = data[index] / 255
    const z = heightValue * 15 // displacementScale is 15
    positions[i + 2] = z // Update Z value
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
  }

  // Recompute normals after modifying vertex positions
  groundGeometry.computeVertexNormals()

  // Set colors based on modified Z values
  for (let i = 0; i < positions.length; i += 3) {
    const z = positions[i + 2]
    const normalizedZ = (z - minZ) / (maxZ - minZ) // Normalize Z between 0 and 1
    const color = baseColor.clone().lerp(lighterGreen, normalizedZ)
    colors.push(color.r, color.g, color.b)
  }

  // Create a Float32BufferAttribute for colors and set it to the geometry
  groundGeometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(colors, 3)
  )

  // Create the material and enable vertex colors
  const groundMaterial = new THREE.MeshStandardMaterial({
    displacementMap: texture,
    //displacementScale: 15,
    color: baseColor, // Base color to tint the whole terrain
    flatShading: true, // Optionally enable flat shading for a faceted look
    vertexColors: true, // Enable vertex colors
    //wireframe: true,
  })

  // Create the mesh with the geometry and material
  ground = new THREE.Mesh(groundGeometry, groundMaterial)

  // Adjust mesh properties
  ground.castShadow = false
  ground.receiveShadow = true
  ground.rotation.x = -Math.PI / 2

  // Add the mesh to the scene (assuming you have a scene object)
  scene.add(ground)
})

const geometry = new THREE.CircleGeometry(10, 32)
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x0e87cc })
const circle = new THREE.Mesh(geometry, circleMaterial)
circle.rotation.x = -Math.PI / 2
circle.position.y = 0.1
circle.position.x = -20
circle.position.z = scene.add(circle)

const playerGeometry = new THREE.BoxGeometry(1, 2, 1)
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xf2c2c2 })
const player = new THREE.Mesh(playerGeometry, playerMaterial)
player.position.y = 20
player.rotation.y = 0.8
player.castShadow = true
player.receiveShadow = true
scene.add(player)

const pillarGeometry = new THREE.BoxGeometry(1, 1, 1)
const pillarMaterial = new THREE.MeshStandardMaterial({ color: 'red' })
const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)

pillar.castShadow = true
pillar.receiveShadow = true
scene.add(pillar)

const playerMovement = {
  left: false,
  right: false,
  up: false,
  down: false,
}

document.addEventListener('keydown', (e) => keyDown(e))
document.addEventListener('keyup', (e) => keyUp(e))

function keyDown(event) {
  switch (event.keyCode) {
    case 38:
      playerMovement.up = true
      break
    case 40:
      playerMovement.down = true
      break
    case 39:
      playerMovement.right = true
      break
    case 37:
      playerMovement.left = true
      break
  }
}
function keyUp(event) {
  switch (event.keyCode) {
    case 38:
      playerMovement.up = false
      break
    case 40:
      playerMovement.down = false
      break
    case 39:
      playerMovement.right = false
      break
    case 37:
      playerMovement.left = false
      break
  }
}

function move(playerMovement) {
  const speed = 0.1
  if (playerMovement.up) {
    player.position.z -= speed
  }
  if (playerMovement.down) {
    player.position.z += speed
  }
  if (playerMovement.left) {
    player.position.x -= speed
  }
  if (playerMovement.right) {
    player.position.x += speed
  }
  if (ground) {
    // Set the ray's origin to the character's current position
    raycaster.set(
      player.position.clone().add(new THREE.Vector3(0, 20, 0)),
      down
    )
    // Check for intersections with the ground
    const intersects = raycaster.intersectObject(ground)
    if (intersects.length > 0) {
      const intersection = intersects[0]
      // Set character's Y position to the intersection point's Y coordinate
      player.position.y = intersection.point.y + 1
    }
  }
}

const size = 100
const divisions = 25
const gridHelper = new THREE.GridHelper(size, divisions)
//scene.add(gridHelper)
const axesHelper = new THREE.AxesHelper(500)
scene.add(axesHelper)

function handleCamera() {
  const targetPosition = new THREE.Vector3(
    player.position.x,
    player.position.y + 15,
    player.position.z + 30
  )
  if (cameraIsPanned) {
    camera.position.lerp(targetPosition, 0.1)
    setTimeout(() => (cameraIsPanned = false), 200)
  } else {
    camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z)
  }
  controls.target.copy(player.position)
  camera.lookAt(player.position)
}

function animate() {
  move(playerMovement)

  const isMoving = Object.values(playerMovement).some((value) => value)
  if (isMoving) {
    handleCamera()
  }
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  setBackground(scene, spaceTexture.image.width, spaceTexture.image.height)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function setBackground(scene, backgroundImageWidth, backgroundImageHeight) {
  var windowSize = function (withScrollBar) {
    var wid = 0
    var hei = 0
    if (typeof window.innerWidth != 'undefined') {
      wid = window.innerWidth
      hei = window.innerHeight
    } else {
      if (document.documentElement.clientWidth == 0) {
        wid = document.body.clientWidth
        hei = document.body.clientHeight
      } else {
        wid = document.documentElement.clientWidth
        hei = document.documentElement.clientHeight
      }
    }
    return {
      width: wid - (withScrollBar ? wid - document.body.offsetWidth + 1 : 0),
      height: hei,
    }
  }

  if (scene.background) {
    var size = windowSize(true)
    var factor =
      backgroundImageWidth / backgroundImageHeight / (size.width / size.height)

    // Set the amount to crop from the top (in pixels)
    var cropTop = 300 // Replace this value with the desired crop amount
    var cropFactor = cropTop / backgroundImageHeight
    scene.background.offset.y =
      factor > 1 ? -cropFactor : (1 - factor - cropFactor) / 2
    scene.background.repeat.y = factor > 1 ? 1 : factor + cropFactor

    scene.background.repeat.x = factor > 1 ? 1 / factor : 1
    scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0
  }
}
