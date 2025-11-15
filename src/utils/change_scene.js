import * as THREE from "three";
import {
  clearAnchors,
  clearFaceMesh,
  removeUIElements,
  clearLights,
} from "./cleanup.js";

/**
 * จัดการการสลับ scene สำหรับ Face Tracking
 * รองรับทั้ง face_item และ face_mesh
 */
export class SceneManager {
  constructor(faceTracking, mindarThree) {
    this.faceTracking = faceTracking;
    this.mindarThree = mindarThree;
    this.currentTrackIndex = 0; // Fixed to T1 for face mode
    this.currentSceneIndex = 0;

    // เก็บ reference ของ scene ปัจจุบัน
    this.currentSceneData = {
      anchorGroups: null,
      modelsMap: null,
      faceMesh: null,
      uiPanel: null,
      lights: [], // เก็บ lights ที่เพิ่มเข้าไป
    };

    // Get all scenes from current track
    this.allScenes = faceTracking.tracks[this.currentTrackIndex]?.scenes || [];
  }

  /**
   * ดึงข้อมูล scene ปัจจุบัน
   */
  getCurrentScene() {
    return this.allScenes[this.currentSceneIndex];
  }

  /**
   * โหลด scene ใหม่ตาม index
   */
  async loadScene(sceneIndex) {
    // Validate scene index
    if (sceneIndex < 0 || sceneIndex >= this.allScenes.length) {
      console.warn(`Invalid scene index: ${sceneIndex}`);
      return false;
    }

    // Clear current scene first
    this.clearCurrentScene();

    // Update scene index
    this.currentSceneIndex = sceneIndex;
    const scene = this.getCurrentScene();

    if (!scene) {
      console.error("Scene not found");
      return false;
    }

    const sceneType = scene.scene_type;
    const assets = scene.assets || [];

    // Load scene based on type
    try {
      if (sceneType === "face_mesh") {
        await this._loadFaceMesh(assets);
      } else if (sceneType === "face_item") {
        await this._loadFaceItems(assets);
      } else {
        console.warn(`Unknown scene_type: ${sceneType}`);
        return false;
      }

      console.log(`Scene ${sceneIndex} (${sceneType}) loaded successfully`);
      return true;
    } catch (error) {
      console.error(`Error loading scene ${sceneIndex}:`, error);
      return false;
    }
  }

  /**
   * ลบ scene ปัจจุบัน (cleanup)
   */
  clearCurrentScene() {
    const { scene } = this.mindarThree;

    // Clear anchors and models
    if (this.currentSceneData.anchorGroups) {
      clearAnchors(this.currentSceneData.anchorGroups);
      this.currentSceneData.anchorGroups = null;
    }

    // Clear face mesh
    if (this.currentSceneData.faceMesh) {
      clearFaceMesh(scene);
      this.currentSceneData.faceMesh = null;
    }

    // Clear lights
    if (this.currentSceneData.lights) {
      clearLights(this.currentSceneData.lights);
      this.currentSceneData.lights = [];
    }

    // Remove UI panel
    removeUIElements(["options-panel"]);
    this.currentSceneData.uiPanel = null;
    this.currentSceneData.modelsMap = null;
  }

  /**
   * สลับไป scene ถัดไป (circular)
   */
  async nextScene() {
    const nextIndex = (this.currentSceneIndex + 1) % this.allScenes.length;
    return await this.loadScene(nextIndex);
  }

  /**
   * สลับไป scene ก่อนหน้า (circular)
   */
  async prevScene() {
    const prevIndex =
      (this.currentSceneIndex - 1 + this.allScenes.length) %
      this.allScenes.length;
    return await this.loadScene(prevIndex);
  }

  /**
   * โหลด Face Mesh scene
   */
  async _loadFaceMesh(assets) {
    const { scene } = this.mindarThree;

    // Add lighting
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
    this.currentSceneData.lights.push(light);

    // Create face mesh
    const faceMesh = this.mindarThree.addFaceMesh();

    // Apply texture if available
    if (assets && assets.length > 0) {
      const textureAsset = assets[0];
      const texture = new THREE.TextureLoader().load(textureAsset.src);
      faceMesh.material.map = texture;
      faceMesh.material.transparent = true;
      faceMesh.material.needsUpdate = true;
    }

    scene.add(faceMesh);
    this.currentSceneData.faceMesh = faceMesh;
  }

  /**
   * โหลด Face Items scene (3D models)
   */
  async _loadFaceItems(assets) {
    const { scene, renderer } = this.mindarThree;

    // Setup renderer
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    this.currentSceneData.lights.push(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
    this.currentSceneData.lights.push(directionalLight);

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
        const anchor = this.mindarThree.addAnchor(anchorIndex);
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
    this.currentSceneData.anchorGroups = anchorGroups;
    this.currentSceneData.modelsMap = modelsMap;

    // Create UI for face items
    this._createUI(assets, modelsMap);
  }

  /**
   * สร้าง UI panel สำหรับเลือกของสวมใส่
   */
  _createUI(assets, modelsMap) {
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
    this.currentSceneData.uiPanel = panel;
  }
}
