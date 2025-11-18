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
export async function createVideoElement(t, targetIndex, modelIdx, assets) {
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

  // ตั้งค่า width/height ตาม aspect ratio
  setVideoAspectRatio(videoEl, `video-${targetIndex}-${modelIdx}`);

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
  setImageAspectRatio(img);

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
