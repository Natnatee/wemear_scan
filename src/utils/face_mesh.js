import * as THREE from "three";

/**
 * โหลด Face Mesh scene
 * @param {Object} mindarThree - MindAR Three instance
 * @param {Array} assets - รายการ assets
 * @param {Object} sceneData - Object สำหรับเก็บข้อมูล scene
 */
export async function loadFaceMesh(mindarThree, assets, sceneData) {
  const { scene } = mindarThree;

  // Add lighting
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);
  sceneData.lights.push(light);

  // Create face mesh
  const faceMesh = mindarThree.addFaceMesh();

  // Apply texture if available
  if (assets && assets.length > 0) {
    const textureAsset = assets[0];
    const texture = new THREE.TextureLoader().load(textureAsset.src);
    faceMesh.material.map = texture;
    faceMesh.material.transparent = true;
    faceMesh.material.needsUpdate = true;
  }

  scene.add(faceMesh);
  sceneData.faceMesh = faceMesh;
}
