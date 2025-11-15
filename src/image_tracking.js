/**
 * โมดูลเรนเดอร์สำหรับ Image Tracking (A-Frame + MindAR)
 * แยกส่วนนี้ออกจาก main.js เพื่อให้ main.js รับผิดชอบเฉพาะ API/params/convert
 */
import { convertToAframe } from "./utils/threeToAframe.js";
import { fetchAndCacheAsset } from "./utils/idbAsset.js";

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

  return { targets, mindFile };
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
    const { targets, mindFile } = convertToRenderFormat(imageData);

    console.log("✅ Converted Targets:", targets);
    console.log("✅ Mind File:", mindFile);

    // 4. เรนเดอร์ AR Scene
    await renderImageTracking({
      targets,
      mindFile,
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
 * @param {Object} params
 * @param {Object} params.targets - โครงสร้าง target และรายการคอนเทนต์
 * @param {string} params.mindFile - พาธไฟล์ .mind
 * @param {(scene: HTMLElement) => void} [params.onReady] - callback เมื่อพร้อมใช้งาน
 */
export async function renderImageTracking({ targets, mindFile, onReady }) {
  // สร้าง a-scene และตั้งค่า MindAR
  const scene = document.createElement("a-scene");
  scene.setAttribute(
    "mindar-image",
    `imageTargetSrc: ${mindFile}; autoStart: true; maxTrack: 1;
    filterMinCF: 0.001;
    filterBeta: 0;
    warmupTolerance: 15;
    missTolerance: 15;`
  );
  scene.setAttribute("vr-mode-ui", "enabled: false");
  scene.setAttribute("device-orientation-permission-ui", "enabled: true");

  // กล้อง
  const camera = document.createElement("a-camera");
  camera.setAttribute("position", "0 0 0");
  camera.setAttribute("look-controls", "enabled: false");
  scene.appendChild(camera);

  // แอสเซท
  const assets = document.createElement("a-assets");
  scene.appendChild(assets);

  // แสงแบบ minimal ที่เหมาะกับโมเดล 3D
  const ambientLight = document.createElement("a-entity");
  ambientLight.setAttribute(
    "light",
    "type: ambient; color: #fff5cc; intensity: 2"
  );
  scene.appendChild(ambientLight);

  const dirLight1 = document.createElement("a-entity");
  dirLight1.setAttribute(
    "light",
    "type: directional; color: #ffffff; intensity: 2; castShadow: true"
  );
  dirLight1.setAttribute("position", "5 10 5");
  dirLight1.setAttribute(
    "shadow",
    "mapSizeWidth: 1024; mapSizeHeight: 1024; cameraNear: 0.5; cameraFar: 50"
  );
  scene.appendChild(dirLight1);

  const dirLight2 = document.createElement("a-entity");
  dirLight2.setAttribute(
    "light",
    "type: directional; color: #aaaaaa; intensity: 2"
  );
  dirLight2.setAttribute("position", "-5 5 -5");
  scene.appendChild(dirLight2);

  document.body.appendChild(scene);

  // ผูก arReady ทันทีหลังสร้าง scene (Minimal single fix)
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
  scene.addEventListener("arError", (e) => {
    console.error("MindAR arError:", e?.detail || e);
  });

  let targetIndex = 0;
  for (const key in targets) {
    if (!targets[key] || !Array.isArray(targets[key])) continue;
    const models = targets[key];

    const entity = document.createElement("a-entity");
    entity.setAttribute("mindar-image-target", `targetIndex: ${targetIndex}`);

    for (let modelIdx = 0; modelIdx < models.length; modelIdx++) {
      const t = models[modelIdx];

      if (t.type === "Video") {
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
        videoEl.setAttribute(
          "position",
          convertToAframe(t.position, "position")
        );
        videoEl.setAttribute(
          "rotation",
          t.rotation ? convertToAframe(t.rotation, "rotation") : "0 0 0"
        );
        entity.appendChild(videoEl);
      }

      if (t.type === "3D Model") {
        const modelBlob = await fetchAndCacheAsset(t.src);
        const modelUrl = URL.createObjectURL(modelBlob);

        const model = document.createElement("a-gltf-model");
        model.setAttribute("src", modelUrl);
        model.setAttribute(
          "animation-mixer",
          "clip: *; loop: repeat; timeScale: 1"
        );
        model.setAttribute("scale", convertToAframe(t.scale, "scale"));
        model.setAttribute("position", convertToAframe(t.position, "position"));
        model.setAttribute(
          "rotation",
          t.rotation ? convertToAframe(t.rotation, "rotation") : "0 0 0"
        );
        entity.appendChild(model);
      }

      if (t.type === "Image") {
        const img = document.createElement("a-image");
        img.setAttribute("src", t.src);
        img.setAttribute("scale", convertToAframe(t.scale, "scale"));
        img.setAttribute("position", convertToAframe(t.position, "position"));
        img.setAttribute(
          "rotation",
          t.rotation ? convertToAframe(t.rotation, "rotation") : "0 0 0"
        );
        if (t.opacity !== undefined) img.setAttribute("opacity", t.opacity);
        entity.appendChild(img);
      }
    }

    scene.appendChild(entity);
    targetIndex++;
  }

  return scene;
}
