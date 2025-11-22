/**
 * โมดูลเรนเดอร์สำหรับ Image Tracking (A-Frame + MindAR)
 * แยกส่วนนี้ออกจาก main.js เพื่อให้ main.js รับผิดชอบเฉพาะ API/params/convert
 */
import { createSceneButtons } from "./utils/change_track_scene.js";
import {
  createScene,
  addLights,
  createVideoElement,
  create3DModelElement,
  createImageElement,
} from "./utils/scene_helpers.js";

/**
 * แปลงข้อมูลจากรูปแบบใหม่ให้เป็นรูปแบบที่ renderImageTracking ต้องการ
 */
function convertToRenderFormat(imageData, sceneId = "S1") {
  const targets = {};
  const mindFile = imageData.mindFile.mind_src;

  // แปลง tracks → scenes → assets เป็น targets object
  imageData.tracks.forEach((track, trackIndex) => {
    const targetKey = `target${trackIndex}`;

    // โฟกัส scene ตาม sceneId
    const currentScene = track.scenes.find(
      (scene) => scene.scene_id === sceneId
    );
    if (!currentScene) return;

    // แปลง assets ให้อยู่ในรูปแบบที่ renderImageTracking ต้องการ
    targets[targetKey] = currentScene.assets.map((asset) => ({
      src: asset.src,
      type: asset.type,
      scale: asset.scale,
      position: asset.position,
      rotation: asset.rotation,
      opacity: asset.opacity,
      loop: asset.loop,
      muted: asset.muted,
      autoplay: asset.autoplay,
      action: asset.action,
      width: asset.width,
      height: asset.height,
    }));
  });

  return { targets, mindFile, tracks: imageData.tracks };
}

/**
 * แสดง error message
 */
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.innerText = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 15px 30px;
    border-radius: 10px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 80%;
    text-align: center;
  `;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

/**
 * ฟังก์ชันหลักสำหรับเริ่มต้น Image Tracking AR
 * อ่านข้อมูลจาก localStorage และเรนเดอร์ AR scene
 */
export async function initImageTracking() {
  const loadingOverlay = document.getElementById("loading-overlay");

  try {
    // 1. อ่านข้อมูลจาก localStorage
    const projectDataStr = localStorage.getItem("projectData");

    if (!projectDataStr) {
      throw new Error("ไม่พบข้อมูลโปรเจค กรุณากลับไปหน้าแรก");
    }

    const projectData = JSON.parse(projectDataStr);
    console.log("📦 Project Data:", projectData);

    // 2. ดึงข้อมูล image tracking mode
    const imageData = projectData.info?.tracking_modes?.image;

    if (!imageData) {
      throw new Error("ไม่พบข้อมูล Image Tracking ในโปรเจคนี้");
    }

    console.log("🎯 Image Tracking Data:", imageData);

    // 3. แปลงข้อมูลเป็นรูปแบบที่ renderImageTracking ต้องการ
    const { targets, mindFile, tracks } = convertToRenderFormat(imageData);

    console.log("✅ Converted Targets:", targets);
    console.log("✅ Mind File:", mindFile);

    // 4. เรนเดอร์ AR Scene
    await renderImageTracking({
      targets,
      mindFile,
      tracks,
      sceneButtonConfig: imageData.setting?.scene_button,
      onReady: (scene) => {
        console.log("🚀 AR Ready!");
        // ซ่อน loading overlay
        if (loadingOverlay) {
          loadingOverlay.classList.add("hidden");
        }
      },
    });
  } catch (error) {
    console.error("❌ Error initializing AR:", error);

    // แสดง error
    showError(`เกิดข้อผิดพลาด: ${error.message}`);

    // ซ่อน loading overlay
    if (loadingOverlay) {
      loadingOverlay.classList.add("hidden");
    }

    // Redirect กลับไปหน้าแรกหลัง 3 วินาที
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  }
}

/**
 * เรนเดอร์ AR scene สำหรับ image tracking
 */
export async function renderImageTracking({
  targets,
  mindFile,
  tracks,
  sceneButtonConfig,
  onReady,
}) {
  // ตัวแปรเก็บ track และ scene ที่กำลังโฟกัส
  let track_focus = null;
  let prev_track_focus = null;
  let scene_focus = "S1";

  const scene = createScene(mindFile);

  const camera = document.createElement("a-camera");
  camera.setAttribute("position", "0 0 0");
  camera.setAttribute("look-controls", "enabled: false");
  scene.appendChild(camera);

  const assets = document.createElement("a-assets");
  scene.appendChild(assets);

  addLights(scene);
  document.body.appendChild(scene);

  scene.addEventListener("arReady", () => {
    Object.keys(targets).forEach((key, tIdx) => {
      targets[key].forEach((t, mIdx) => {
        if (t.type === "Video") {
          document.getElementById(`video-${tIdx}-${mIdx}`)?.play?.();
        }
      });
    });
    if (typeof onReady === "function") onReady(scene);
  });

  scene.addEventListener("arError", (e) =>
    console.error("MindAR arError:", e?.detail || e)
  );

  let targetIndex = 0;
  const entityMap = {}; // เก็บ reference ของแต่ละ entity

  for (const key in targets) {
    if (!targets[key] || !Array.isArray(targets[key])) continue;

    const entity = document.createElement("a-entity");
    entity.setAttribute("mindar-image-target", `targetIndex: ${targetIndex}`);

    // เพิ่ม event listener สำหรับ tracking
    const trackId = `T${targetIndex + 1}`;
    const currentTrackIndex = targetIndex;

    // เก็บ reference
    entityMap[trackId] = entity;

    // ฟังก์ชันอัพเดท assets ใน entity
    const updateEntityAssets = async (sceneId) => {
      // ลบ assets เก่าทั้งหมด
      while (entity.firstChild) {
        entity.removeChild(entity.firstChild);
      }

      // หา scene ที่ต้องการ
      const currentTrack = tracks[currentTrackIndex];
      const targetScene = currentTrack.scenes.find(
        (s) => s.scene_id === sceneId
      );

      if (!targetScene) {
        console.warn(`Scene ${sceneId} not found in ${trackId}`);
        return;
      }

      console.log(`🎬 Updating ${trackId} to ${sceneId}`);

      // สร้าง assets ใหม่
      for (let i = 0; i < targetScene.assets.length; i++) {
        const asset = targetScene.assets[i];
        let element;

        if (asset.type === "Video") {
          // สร้าง unique ID สำหรับ video ใหม่
          const uniqueId = `video-${currentTrackIndex}-${i}-${sceneId}-${Date.now()}`;
          element = await createVideoElement(
            asset,
            currentTrackIndex,
            i,
            assets,
            uniqueId
          );

          // เล่น video หลังสร้างเสร็จ
          setTimeout(() => {
            const videoElement = document.getElementById(uniqueId);
            if (videoElement) {
              videoElement
                .play()
                .catch((err) => console.warn("Video play failed:", err));
            }
          }, 200);
        } else if (asset.type === "3D Model") {
          element = await create3DModelElement(asset);
        } else if (asset.type === "Image") {
          // ใช้ fadeIn=true เมื่ออัพเดท scene
          element = createImageElement(asset, true);
        }

        if (element) entity.appendChild(element);
      }
    };

    entity.addEventListener("targetFound", () => {
      // ถ้าเปลี่ยน track ให้รีเซ็ต scene_focus เป็น S1
      if (prev_track_focus !== null && prev_track_focus !== trackId) {
        scene_focus = "S1";
        console.log("🔄 Reset scene_focus to S1");
        // อัพเดท entity ให้แสดง S1
        updateEntityAssets(scene_focus);
      }

      // เปลี่ยนค่า track_focus
      prev_track_focus = track_focus;
      track_focus = trackId;
      console.log("track_focus:", track_focus);
      console.log("scene_focus:", scene_focus);

      // ตรวจสอบว่า track นี้มีกี่ scene
      const currentTrack = tracks?.[currentTrackIndex];
      const hasMultipleScenes = currentTrack?.scenes?.length > 1;

      // ฟังก์ชันเปลี่ยน scene
      const changeScene = async (direction) => {
        const sceneCount = currentTrack.scenes.length;
        const currentSceneNum = parseInt(scene_focus.replace("S", ""));
        let newSceneNum;

        if (direction === "next") {
          newSceneNum = currentSceneNum >= sceneCount ? 1 : currentSceneNum + 1;
        } else {
          newSceneNum = currentSceneNum <= 1 ? sceneCount : currentSceneNum - 1;
        }

        scene_focus = `S${newSceneNum}`;
        console.log("scene_focus:", scene_focus);

        // อัพเดท AR scene
        await updateEntityAssets(scene_focus);
      };

      // แสดงหรือซ่อนปุ่มตามจำนวน scene
      if (sceneButtonConfig?.show && hasMultipleScenes) {
        // ถ้ายังไม่มีปุ่ม ให้สร้างใหม่
        if (!document.querySelector(".scene-button-left")) {
          createSceneButtons(sceneButtonConfig, changeScene);
        }
        // แสดงปุ่ม
        document
          .querySelectorAll(".scene-button-left, .scene-button-right")
          .forEach((btn) => {
            btn.style.display = "block";
          });
      } else {
        // ซ่อนปุ่ม
        document
          .querySelectorAll(".scene-button-left, .scene-button-right")
          .forEach((btn) => {
            btn.style.display = "none";
          });
      }
    });

    entity.addEventListener("targetLost", () => {
      // ซ่อนปุ่มเมื่อหาย target
      document
        .querySelectorAll(".scene-button-left, .scene-button-right")
        .forEach((btn) => {
          btn.style.display = "none";
        });
    });

    for (let modelIdx = 0; modelIdx < targets[key].length; modelIdx++) {
      const t = targets[key][modelIdx];
      let element;

      if (t.type === "Video") {
        element = await createVideoElement(t, targetIndex, modelIdx, assets);
      } else if (t.type === "3D Model") {
        element = await create3DModelElement(t);
      } else if (t.type === "Image") {
        element = createImageElement(t);
      }

      if (element) entity.appendChild(element);
    }

    scene.appendChild(entity);
    targetIndex++;
  }

  return scene;
}
