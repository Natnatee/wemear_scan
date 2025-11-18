import * as THREE from "three";

/**
 * โหลด Face Items scene (3D models)
 * @param {Object} mindarThree - MindAR Three instance
 * @param {Array} assets - รายการ assets
 * @param {Object} sceneData - Object สำหรับเก็บข้อมูล scene
 */
export async function loadFaceItems(mindarThree, assets, sceneData) {
  const { scene, renderer } = mindarThree;

  // Setup renderer
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  sceneData.lights.push(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);
  sceneData.lights.push(directionalLight);

  // Load GLTF models
  const { GLTFLoader } = await import(
    "three/examples/jsm/loaders/GLTFLoader.js"
  );
  const loader = new GLTFLoader();

  const anchorGroups = {};
  const modelsMap = {};

  // Load all assets
  for (const asset of assets) {
    const anchorIndex = asset.anchorIndex;

    // Create anchor if not exists
    if (!anchorGroups[anchorIndex]) {
      const anchor = mindarThree.addAnchor(anchorIndex);
      anchorGroups[anchorIndex] = anchor;
    }

    try {
      // Load GLTF model
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          asset.src,
          (gltf) => resolve(gltf),
          undefined,
          (error) => reject(error)
        );
      });

      const model = gltf.scene;

      // Apply transformations
      if (asset.position) {
        model.position.set(
          asset.position[0],
          asset.position[1],
          asset.position[2]
        );
      }
      if (asset.rotation) {
        model.rotation.set(
          THREE.MathUtils.degToRad(asset.rotation[0]),
          THREE.MathUtils.degToRad(asset.rotation[1]),
          THREE.MathUtils.degToRad(asset.rotation[2])
        );
      }
      if (asset.scale) {
        model.scale.set(asset.scale[0], asset.scale[1], asset.scale[2]);
      }

      // Set visibility
      model.visible = asset.visible !== undefined ? asset.visible : true;

      // Store metadata
      model.userData.assetId = asset.asset_id;
      model.userData.assetName = asset.asset_name;

      // Handle head occluder
      if (asset.mindar_face_occluder) {
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.colorWrite = false;
            child.renderOrder = 0;
          }
        });
      }

      anchorGroups[anchorIndex].group.add(model);

      // Store in modelsMap (except occluder)
      if (!asset.mindar_face_occluder && asset.asset_name) {
        const itemKey = asset.asset_name;
        if (!modelsMap[itemKey]) {
          modelsMap[itemKey] = [];
        }
        modelsMap[itemKey].push(model);
      }
    } catch (error) {
      console.error(`Error loading model ${asset.src}:`, error);
    }
  }

  // Store references
  sceneData.anchorGroups = anchorGroups;
  sceneData.modelsMap = modelsMap;

  // Create UI for face items
  createFaceItemUI(assets, modelsMap, sceneData);
}

/**
 * สร้าง UI panel สำหรับเลือกของสวมใส่
 * @param {Array} assets - รายการ assets
 * @param {Object} modelsMap - Map ของ models
 * @param {Object} sceneData - Object สำหรับเก็บข้อมูล scene
 */
function createFaceItemUI(assets, modelsMap, sceneData) {
  // Create options panel
  const panel = document.createElement("div");
  panel.className = "options-panel";
  panel.style.cssText = `
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    z-index: 2;
    gap: 5px;
    padding: 10px;
    max-width: 90vw;
  `;

  // Get unique items
  const uniqueItems = {};
  assets.forEach((asset) => {
    if (
      !asset.mindar_face_occluder &&
      asset.src_thumbnail &&
      asset.asset_name
    ) {
      const itemKey = asset.asset_name;

      if (!uniqueItems[itemKey]) {
        uniqueItems[itemKey] = {
          thumbnail: asset.src_thumbnail,
          name: itemKey,
          visible: asset.visible !== undefined ? asset.visible : true,
        };
      }
    }
  });

  // Create buttons
  Object.entries(uniqueItems).forEach(([itemKey, item]) => {
    const button = document.createElement("img");
    button.src = item.thumbnail;
    button.style.cssText = `
      border: solid 2px;
      width: 50px;
      height: 50px;
      object-fit: cover;
      cursor: pointer;
      border-color: ${item.visible ? "green" : "#ccc"};
    `;

    // Toggle visibility on click
    button.addEventListener("click", () => {
      item.visible = !item.visible;
      button.style.borderColor = item.visible ? "green" : "#ccc";

      // Toggle related models
      if (modelsMap[itemKey]) {
        modelsMap[itemKey].forEach((model) => {
          model.visible = item.visible;
        });
      }
    });

    panel.appendChild(button);
  });

  document.body.appendChild(panel);
  sceneData.uiPanel = panel;
}
