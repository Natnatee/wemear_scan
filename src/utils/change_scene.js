import { loadFaceMesh } from "./face_mesh.js";
import { loadFaceItems } from "./face_item.js";

/**
 * สร้าง Scene Manager สำหรับ Face Tracking
 * @param {Object} faceTracking - ข้อมูล face tracking จาก projectData
 * @param {Object} mindarThree - MindAR Three instance
 * @returns {Object} Scene manager object
 */
export function createSceneManager(faceTracking, mindarThree) {
  const trackIndex = 0; // Fixed to T1 for face mode
  let currentSceneIndex = 0;

  // เก็บ reference ของ scene ปัจจุบัน
  const sceneData = {
    anchorGroups: null,
    modelsMap: null,
    faceMesh: null,
    uiPanel: null,
    lights: [],
  };

  // Get all scenes from current track
  const allScenes = faceTracking.tracks[trackIndex]?.scenes || [];

  /**
   * ดึงข้อมูล scene ปัจจุบัน
   */
  function getCurrentScene() {
    return allScenes[currentSceneIndex];
  }

  /**
   * ลบ scene ปัจจุบัน (แบบง่ายๆ)
   */
  function clearCurrentScene() {
    const { scene } = mindarThree;

    // Clear anchors - ลบ children ทั้งหมด
    if (sceneData.anchorGroups) {
      Object.values(sceneData.anchorGroups).forEach((anchor) => {
        if (anchor && anchor.group) {
          anchor.group.clear();
        }
      });
      sceneData.anchorGroups = null;
    }

    // Remove face mesh
    if (sceneData.faceMesh) {
      scene.remove(sceneData.faceMesh);
      sceneData.faceMesh = null;
    }

    // Remove lights
    sceneData.lights.forEach((light) => {
      scene.remove(light);
    });
    sceneData.lights = [];

    // Remove UI panel
    document.querySelector(".options-panel")?.remove();
    sceneData.uiPanel = null;
    sceneData.modelsMap = null;
  }

  /**
   * โหลด scene ใหม่ตาม index
   */
  async function loadScene(sceneIndex) {
    // Validate scene index
    if (sceneIndex < 0 || sceneIndex >= allScenes.length) {
      console.warn(`Invalid scene index: ${sceneIndex}`);
      return false;
    }

    // Clear current scene first
    clearCurrentScene();

    // Update scene index
    currentSceneIndex = sceneIndex;
    const scene = getCurrentScene();

    if (!scene) {
      console.error("Scene not found");
      return false;
    }

    const sceneType = scene.scene_type;
    const assets = scene.assets || [];

    // Load scene based on type
    try {
      if (sceneType === "face_mesh") {
        await loadFaceMesh(mindarThree, assets, sceneData);
      } else if (sceneType === "face_item") {
        await loadFaceItems(mindarThree, assets, sceneData);
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
   * สลับไป scene ถัดไป (circular)
   */
  async function nextScene() {
    const nextIndex = (currentSceneIndex + 1) % allScenes.length;
    return await loadScene(nextIndex);
  }

  /**
   * สลับไป scene ก่อนหน้า (circular)
   */
  async function prevScene() {
    const prevIndex =
      (currentSceneIndex - 1 + allScenes.length) % allScenes.length;
    return await loadScene(prevIndex);
  }

  return {
    getCurrentScene,
    loadScene,
    nextScene,
    prevScene,
    clearCurrentScene,
  };
}
