/**
 * โมดูลเรนเดอร์สำหรับ Image Tracking (A-Frame + MindAR)
 * แยกส่วนนี้ออกจาก main.js เพื่อให้ main.js รับผิดชอบเฉพาะ API/params/convert
 */
import { convertToAframe } from "./utils/threeToAframe.js";
import { fetchAndCacheAsset } from "./utils/idbAsset.js";
import { createSceneButtons } from "./utils/change_track_scene.js";

/**
 * แปลงข้อมูลจากรูปแบบใหม่ให้เป็นรูปแบบที่ renderImageTracking ต้องการ
 */
function convertToRenderFormat(imageData) {
  const targets = {};
  const mindFile = imageData.mindFile.mind_src;

  // แปลง tracks → scenes → assets เป็น targets object
  imageData.tracks.forEach((track, trackIndex) => {
    const targetKey = `target${trackIndex}`;

    // โฟกัส scene แรก (S1)
    const firstScene = track.scenes.find((scene) => scene.scene_id === "S1");
    if (!firstScene) return;

    // แปลง assets ให้อยู่ในรูปแบบที่ renderImageTracking ต้องการ
    targets[targetKey] = firstScene.assets.map((asset) => ({
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
 * สร้าง scene และตั้งค่า MindAR
 */
function createScene(mindFile) {
  const scene = document.createElement("a-scene");
  scene.setAttribute(
    "mindar-image",
    `imageTargetSrc: ${mindFile}; autoStart: true; maxTrack: 1; filterMinCF: 0.001; filterBeta: 0; warmupTolerance: 15; missTolerance: 15;`
  );
  scene.setAttribute("vr-mode-ui", "enabled: false");
  scene.setAttribute("device-orientation-permission-ui", "enabled: true");
  return scene;
}

/**
 * เพิ่มแสงให้กับ scene
 */
function addLights(scene) {
  const ambientLight = document.createElement("a-entity");
  ambientLight.setAttribute(
    "light",
    "type: ambient; color: #fff5cc; intensity: 2"
  );

  const dirLight1 = document.createElement("a-entity");
  dirLight1.setAttribute(
    "light",
    "type: directional; color: #ffffff; intensity: 2; castShadow: true"
  );
  dirLight1.setAttribute("position", "5 10 5");

  const dirLight2 = document.createElement("a-entity");
  dirLight2.setAttribute(
    "light",
    "type: directional; color: #aaaaaa; intensity: 2"
  );
  dirLight2.setAttribute("position", "-5 5 -5");

  scene.appendChild(ambientLight);
  scene.appendChild(dirLight1);
  scene.appendChild(dirLight2);
}

/**
 * สร้าง video element
 */
async function createVideoElement(t, targetIndex, modelIdx, assets) {
  const videoBlob = await fetchAndCacheAsset(t.src);
  const videoUrl = URL.createObjectURL(videoBlob);

  const video = document.createElement("video");
  video.id = `video-${targetIndex}-${modelIdx}`;
  video.src = videoUrl;
  video.autoplay = t.autoplay ?? false;
  video.loop = t.loop ?? false;
  video.muted = t.muted ?? true;
  video.playsInline = true;
  assets.appendChild(video);

  const videoEl = document.createElement("a-video");
  videoEl.setAttribute("src", `#video-${targetIndex}-${modelIdx}`);
  videoEl.setAttribute("scale", convertToAframe(t.scale, "scale"));
  videoEl.setAttribute("position", convertToAframe(t.position, "position"));
  videoEl.setAttribute(
    "rotation",
    t.rotation ? convertToAframe(t.rotation, "rotation") : "0 0 0"
  );
  return videoEl;
}

/**
 * สร้าง 3D model element
 */
async function create3DModelElement(t) {
  const modelBlob = await fetchAndCacheAsset(t.src);
  const modelUrl = URL.createObjectURL(modelBlob);

  const model = document.createElement("a-gltf-model");
  model.setAttribute("src", modelUrl);
  model.setAttribute("animation-mixer", "clip: *; loop: repeat; timeScale: 1");
  model.setAttribute("scale", convertToAframe(t.scale, "scale"));
  model.setAttribute("position", convertToAframe(t.position, "position"));
  model.setAttribute(
    "rotation",
    t.rotation ? convertToAframe(t.rotation, "rotation") : "0 0 0"
  );
  return model;
}

/**
 * สร้าง image element
 */
function createImageElement(t) {
  const img = document.createElement("a-image");
  img.setAttribute("src", t.src);
  img.setAttribute("scale", convertToAframe(t.scale, "scale"));
  img.setAttribute("position", convertToAframe(t.position, "position"));
  img.setAttribute(
    "rotation",
    t.rotation ? convertToAframe(t.rotation, "rotation") : "0 0 0"
  );
  if (t.opacity !== undefined) img.setAttribute("opacity", t.opacity);
  return img;
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
  // ตัวแปรเก็บ track ที่กำลังโฟกัส
  let track_focus = null;

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
  for (const key in targets) {
    if (!targets[key] || !Array.isArray(targets[key])) continue;

    const entity = document.createElement("a-entity");
    entity.setAttribute("mindar-image-target", `targetIndex: ${targetIndex}`);

    // เพิ่ม event listener สำหรับ tracking
    const trackId = `T${targetIndex + 1}`;
    const currentTrackIndex = targetIndex;

    entity.addEventListener("targetFound", () => {
      // เปลี่ยนค่า track_focus
      track_focus = trackId;
      console.log("track_focus:", track_focus);

      // ตรวจสอบว่า track นี้มีกี่ scene
      const currentTrack = tracks?.[currentTrackIndex];
      const hasMultipleScenes = currentTrack?.scenes?.length > 1;

      // แสดงหรือซ่อนปุ่มตามจำนวน scene
      if (sceneButtonConfig?.show && hasMultipleScenes) {
        // ถ้ายังไม่มีปุ่ม ให้สร้างใหม่
        if (!document.querySelector(".scene-button-left")) {
          createSceneButtons(sceneButtonConfig);
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
