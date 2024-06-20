// crow.js
import * as THREE from 'three'

export function createCrow() {
  const crow = new THREE.Group()

  // Create the body
  const bodyGeometry = new THREE.SphereGeometry(1, 32, 32)
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 2
  crow.add(body)

  // Create the head
  const headGeometry = new THREE.SphereGeometry(0.5, 32, 32)
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 3
  head.position.z = -1
  crow.add(head)

  // Create the beak
  const beakGeometry = new THREE.ConeGeometry(0.2, 0.8, 32)
  const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 })
  const beak = new THREE.Mesh(beakGeometry, beakMaterial)
  beak.rotation.x = Math.PI / 2
  beak.position.y = 3
  beak.position.z = -1.5
  crow.add(beak)

  // Create the wings
  const wingGeometry = new THREE.BoxGeometry(0.1, 4, 1) // Thinner and longer
  const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })

  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial)
  leftWing.position.y = 2
  leftWing.position.x = -1.2
  leftWing.rotation.z = Math.PI / 6 // Slight angle
  leftWing.rotation.y = Math.PI / 8 // Rotate to face backward
  crow.add(leftWing)

  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial)
  rightWing.position.y = 2
  rightWing.position.x = 1.2
  rightWing.rotation.z = -Math.PI / 6 // Slight angle
  rightWing.rotation.y = -Math.PI / 8 // Rotate to face backward
  crow.add(rightWing)

  // Create the tail
  const tailGeometry = new THREE.BoxGeometry(0.1, 1, 2)
  const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
  const tail = new THREE.Mesh(tailGeometry, tailMaterial)
  tail.position.y = 1.2
  tail.position.z = 1.5
  tail.rotation.x = Math.PI / 6
  crow.add(tail)

  // Create the legs
  const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32)
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
  leftLeg.position.y = 1
  leftLeg.position.x = -0.5
  leftLeg.position.z = 1
  crow.add(leftLeg)

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
  rightLeg.position.y = 1
  rightLeg.position.x = 0.5
  rightLeg.position.z = 1
  crow.add(rightLeg)

  return crow
}
