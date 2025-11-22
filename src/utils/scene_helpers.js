/**
 * ไฟล์รวม Helper Functions สำหรับสร้าง AR Scene Elements
 */
import { convertToAframe } from "./threeToAframe.js";
import { fetchAndCacheAsset } from "./idbAsset.js";
import { setImageAspectRatio, setVideoAspectRatio } from "./width_height.js";

/**
 * สร้าง scene และตั้งค่า MindAR
 */
export function createScene(mindFile) {
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
export function addLights(scene) {
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
export async function createVideoElement(
  t,
  targetIndex,
  modelIdx,
  assets,
  uniqueId = null
) {
  const videoBlob = await fetchAndCacheAsset(t.src);
  const videoUrl = URL.createObjectURL(videoBlob);

  // สร้าง unique ID เพื่อไม่ให้ซ้ำกันเมื่อเปลี่ยน scene
  const videoId = uniqueId || `video-${targetIndex}-${modelIdx}-${Date.now()}`;

  const video = document.createElement("video");
  video.id = videoId;
  video.src = videoUrl;
  video.autoplay = t.autoplay ?? true;
  video.loop = t.loop ?? true;
  video.muted = t.muted ?? true;
  video.playsInline = true;
  assets.appendChild(video);

  const videoEl = document.createElement("a-video");
  videoEl.setAttribute("src", `#${videoId}`);
  videoEl.setAttribute("scale", convertToAframe(t.scale, "scale"));
  videoEl.setAttribute("position", convertToAframe(t.position, "position"));
  videoEl.setAttribute(
    "rotation",
    t.rotation ? convertToAframe(t.rotation, "rotation") : "0 0 0"
  );

  // ตั้งค่า video attributes สำหรับ a-video
  videoEl.setAttribute("autoplay", t.autoplay ?? true);
  videoEl.setAttribute("loop", t.loop ?? true);

  // ตั้งค่า width/height ตาม aspect ratio
  if (!t.width || !t.height) {
    setVideoAspectRatio(videoEl, videoId).then(({ width, height }) => {
      videoEl.setAttribute("width", width);
      videoEl.setAttribute("height", height);
    });
  } else {
    videoEl.setAttribute("width", t.width);
    videoEl.setAttribute("height", t.height);
  }

  // เล่น video ทันทีหลังสร้าง
  setTimeout(() => {
    video.play().catch((err) => console.warn("Video autoplay failed:", err));
  }, 100);

  return videoEl;
}

/**
 * สร้าง 3D model element
 */
export async function create3DModelElement(t) {
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
export function createImageElement(t, fadeIn = false) {
  const img = document.createElement("a-image");
  img.setAttribute("src", t.src);
  img.setAttribute("scale", convertToAframe(t.scale, "scale"));
  img.setAttribute("position", convertToAframe(t.position, "position"));
  img.setAttribute(
    "rotation",
    t.rotation ? convertToAframe(t.rotation, "rotation") : "0 0 0"
  );

  // ตั้งค่า width/height ตาม aspect ratio
  if (!t.width || !t.height) {
    setImageAspectRatio(img).then(({ width, height }) => {
      img.setAttribute("width", width);
      img.setAttribute("height", height);
    });
  } else {
    img.setAttribute("width", t.width);
    img.setAttribute("height", t.height);
  }

  if (fadeIn) {
    // เริ่มต้นด้วย opacity 0 แล้วค่อย fade in
    img.setAttribute("opacity", "0");

    img.addEventListener("materialtextureloaded", () => {
      img.setAttribute("opacity", t.opacity !== undefined ? t.opacity : 1);
    });
  } else {
    if (t.opacity !== undefined) img.setAttribute("opacity", t.opacity);
  }

  return img;
}
