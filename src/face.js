import * as THREE from "three";
import { MindARThree } from "./src_mindar/face-target/three";
import { createSceneManager } from "./utils/change_scene.js";
import { initHandTracking } from "./hand.js"; // ← เพิ่มบรรทัดนี้
// ดึง projectData จาก localStorage
const getProjectData = () => {
  const data = localStorage.getItem("projectData");
  if (!data) {
    console.error("No projectData found in localStorage");
    return null;
  }
  return JSON.parse(data);
};

// สร้างปุ่ม scene button (มุมซ้ายล่าง และ ขวาล่าง)
const createSceneButton = (setting, sceneManager) => {
  if (!setting || !setting.scene_button || !setting.scene_button.show) return;

  const createBtn = (position, src, onClick) => {
    if (!src) return null;
    const button = document.createElement("img");
    button.src = src;
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      ${position}: 20px;
      width: 50px;
      height: 50px;
      cursor: pointer;
      transition: transform 0.15s ease;
      z-index: 3;
      user-select: none;
    `;

    // ขยายแล้วหดกลับ + เรียก onClick callback
    button.addEventListener("click", async () => {
      button.style.transform = "scale(1.5)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 220);

      // Execute scene change
      if (onClick) {
        await onClick();
      }
    });

    document.body.appendChild(button);
    return button;
  };

  // สร้างปุ่มซ้ายและขวา โดยอ่าน src_left / src_right หากมี
  const sb = setting.scene_button || {};
  const srcLeft = sb.src_left || sb.src;
  const srcRight = sb.src_right || sb.src;

  // ปุ่มซ้าย = prevScene, ปุ่มขวา = nextScene
  createBtn("left", srcLeft, () => sceneManager.prevScene());
  createBtn("right", srcRight, () => sceneManager.nextScene());
};

// ฟังก์ชันหลักในการ render
export const initFaceTracking = async (container) => {
  const projectData = getProjectData();

  if (!projectData || !projectData.info) {
    console.error("Invalid project data");
    return;
  }

  const faceTracking = projectData.info.tracking_modes?.face;
  if (
    !faceTracking ||
    !faceTracking.tracks ||
    faceTracking.tracks.length === 0 ||
    !faceTracking.tracks[0].scenes ||
    faceTracking.tracks[0].scenes.length === 0
  ) {
    console.error("No face tracking scenes found");
    return;
  }

  // ดึง setting
  const setting = faceTracking.setting;

  // สร้าง MindAR instance
  const mindarThree = new MindARThree({
    container: container || document.querySelector("#container"),
  });

  const { renderer, scene, camera } = mindarThree;

  // สร้าง SceneManager (Fixed to track T1 for face mode)
  const sceneManager = createSceneManager(faceTracking, mindarThree);

  // โหลด scene แรก (index 0)
  await sceneManager.loadScene(0);

  // สร้าง scene button ถ้ามี (เชื่อมกับ sceneManager)
  createSceneButton(setting, sceneManager);

  // เริ่มต้น MindAR
  await mindarThree.start();

  //! ===== Setup Hand Tracking ===== ← เพิ่มตรงนี้
  const videoElement = container.querySelector("video");
  if (videoElement) {
    const handTracker = await initHandTracking(videoElement);

    // ผูก callback สำหรับการปัดมือกับการเปลี่ยน scene
    if (handTracker) {
      handTracker.setSwipeCallbacks(
        () => sceneManager.prevScene(), // ปัดซ้าย = scene ก่อนหน้า
        () => sceneManager.nextScene() // ปัดขวา = scene ถัดไป
      );
    }
  }

  // Animation loop
  renderer.setAnimationLoop(() => {
    // Update blendshapes for face_avatar scene
    const sceneData = sceneManager.getSceneData();
    if (sceneData.avatar) {
      const estimate = mindarThree.getLatestEstimate();
      if (estimate && estimate.blendshapes) {
        sceneData.avatar.updateBlendshapes(estimate.blendshapes);
      }
    }
    renderer.render(scene, camera);
  });

  return mindarThree;
};

// สำหรับการใช้งานใน HTML
if (typeof window !== "undefined") {
  window.initFaceTracking = initFaceTracking;
}
