/**
 * โมดูลเรนเดอร์สำหรับ Image Tracking (A-Frame + MindAR)
 * แยกส่วนนี้ออกจาก main.js เพื่อให้ main.js รับผิดชอบเฉพาะ API/params/convert
 */
import { convertToAframe } from "./utils/threeToAframe.js";
import { fetchAndCacheAsset } from "./utils/idbAsset.js";

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
    `imageTargetSrc: ${mindFile}; autoStart: true; maxTrack: 3;`
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
  ambientLight.setAttribute("light", "type: ambient; color: #fff5cc; intensity: 2");
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
  dirLight2.setAttribute("light", "type: directional; color: #aaaaaa; intensity: 2");
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
        videoEl.setAttribute("position", convertToAframe(t.position, "position"));
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
