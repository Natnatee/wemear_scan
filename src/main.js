/**
 * Utility functions for converting Three.js values to A-Frame format
 */
import { convertToAframe } from "./utils/threeToAframe.js";
/**
 * IndexedDB asset caching utilities
 */
import { fetchAndCacheAsset } from "./utils/idbAsset.js";
/**
 * Data format conversion utilities
 */
import { convertToLegacyFormat } from "./utils/convertData2.js";

const SUPABASE_URL = "https://supabase.wemear.com/rest/v1/project";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU2NTkyMDUzLCJleHAiOjIwODE1Nzc2MDB9.KjLYDG826zqcmxDIXIdnUvn-T_RVoSWyUFB-bA_Wm1E";

/**
 * ดึง project_id จาก URL path
 * เช่น scan.wemear.com/6663a37d-f3e5-4d38-9db3-e0f89a21a5a0
 */
function getProjectIdFromUrl() {
  const pathname = window.location.pathname;
  // ลบ leading slash และ trailing slash
  const projectId = pathname.replace(/^\/|\/$/g, "");
  return projectId || null;
}

/**
 * ดึงข้อมูล project จาก Supabase API
 */
async function fetchProjectData(projectId) {
  const url = `${SUPABASE_URL}?select=*,project_info(info)&project_id=eq.${projectId}`;

  console.log("Fetching from URL:", url);

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
    },
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(
      `API Error: ${response.status} ${response.statusText}\nURL: ${url}\nResponse: ${errorText}`
    );
  }

  const data = await response.json();
  console.log("API Response Data:", data);
  console.log("Data length:", data.length);
  if (data.length > 0) {
    console.log("First project:", data[0]);
    console.log("project_info:", data[0].project_info);
  }

  if (!data || data.length === 0) {
    throw new Error(`Project not found with ID: ${projectId}\nURL: ${url}`);
  }

  // แปลงโครงสร้างให้ตรงกับ make_project_no_share_asset
  const project = data[0];

  // ตรวจสอบว่ามี project_info หรือไม่
  if (!project.project_info || project.project_info.length === 0) {
    throw new Error(
      `Project found but missing project_info data.\nProject: ${JSON.stringify(
        project,
        null,
        2
      )}`
    );
  }

  return {
    ...project,
    info: project.project_info[0].info,
  };
}

async function initAR() {
  try {
    // ดึง project_id จาก URL
    const projectId = getProjectIdFromUrl();

    console.log("Project ID from URL:", projectId);

    if (!projectId) {
      const errorMsg =
        "ไม่พบ project_id ใน URL\nกรุณาใช้รูปแบบ: scan.wemear.com/YOUR_PROJECT_ID";
      document.getElementById("status").innerText = errorMsg;
      throw new Error(errorMsg);
    }

    document.getElementById(
      "status"
    ).innerText = `กำลังโหลดข้อมูลโปรเจค...\nProject ID: ${projectId}`;

    // ดึงข้อมูลจาก API
    const projectData = await fetchProjectData(projectId);
    console.log("Project Data:", projectData);

    // แปลงข้อมูลจากรูปแบบใหม่เป็นรูปแบบเก่า
    const legacyData = convertToLegacyFormat(projectData);
    console.log("Legacy Data:", legacyData);
    const targets = legacyData["image tracking"];
    const mindFile = legacyData.mindFile;

    document.getElementById("status").innerText = "กำลังเตรียม AR...";

    const scene = document.createElement("a-scene");
    scene.setAttribute(
      "mindar-image",
      `imageTargetSrc: ${mindFile}; autoStart: true; maxTrack: 3;`
    );
    scene.setAttribute("vr-mode-ui", "enabled: false");
    scene.setAttribute("device-orientation-permission-ui", "enabled: true");

    const camera = document.createElement("a-camera");
    camera.setAttribute("position", "0 0 0");
    camera.setAttribute("look-controls", "enabled: false");
    scene.appendChild(camera);

    const assets = document.createElement("a-assets");
    scene.appendChild(assets);
    // --- Add lights similar to modelViewer ---
    // Ambient light
    const ambientLight = document.createElement("a-entity");
    ambientLight.setAttribute(
      "light",
      "type: ambient; color: #fff5cc; intensity: 2"
    );
    scene.appendChild(ambientLight);

    // Directional light 1 (main)
    const dirLight1 = document.createElement("a-entity");
    dirLight1.setAttribute(
      "light",
      "type: directional; color: #ffffff; intensity: 2; castShadow: true"
    );
    dirLight1.setAttribute("position", "5 10 5");
    // Shadow tuning (A-Frame/light adapters may ignore unsupported props)
    dirLight1.setAttribute(
      "shadow",
      "mapSizeWidth: 1024; mapSizeHeight: 1024; cameraNear: 0.5; cameraFar: 50"
    );
    scene.appendChild(dirLight1);

    // Directional light 2 (fill)
    const dirLight2 = document.createElement("a-entity");
    dirLight2.setAttribute(
      "light",
      "type: directional; color: #aaaaaa; intensity: 2"
    );
    dirLight2.setAttribute("position", "-5 5 -5");
    scene.appendChild(dirLight2);

    document.body.appendChild(scene);

    let targetIndex = 0;

    for (const key in targets) {
      if (!targets[key] || !Array.isArray(targets[key])) continue;

      const models = targets[key];

      // สร้าง entity ของ target
      const entity = document.createElement("a-entity");
      entity.setAttribute("mindar-image-target", `targetIndex: ${targetIndex}`);

      for (let modelIdx = 0; modelIdx < models.length; modelIdx++) {
        const t = models[modelIdx];

        // Video
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

        // 3D Model
        if (t.type === "3D Model") {
          const modelBlob = await fetchAndCacheAsset(t.src);
          const modelUrl = URL.createObjectURL(modelBlob);

          const model = document.createElement("a-gltf-model");
          model.setAttribute("src", modelUrl);
          model.setAttribute("scale", convertToAframe(t.scale, "scale"));
          model.setAttribute(
            "position",
            convertToAframe(t.position, "position")
          );
          model.setAttribute(
            "rotation",
            t.rotation ? convertToAframe(t.rotation, "rotation") : "0 0 0"
          );
          entity.appendChild(model);
        }

        // Image
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

    scene.addEventListener("arReady", () => {
      Object.keys(targets).forEach((key, tIdx) => {
        targets[key].forEach((t, mIdx) => {
          if (t.type === "Video")
            document.getElementById(`video-${tIdx}-${mIdx}`).play();
        });
      });
      document.getElementById("status").innerText = "AR พร้อมใช้งาน!";
    });
  } catch (error) {
    console.error("Failed to initialize AR:", error);

    // แสดงข้อผิดพลาดแบบละเอียด
    const statusEl = document.getElementById("status");
    statusEl.style.whiteSpace = "pre-wrap";
    statusEl.style.textAlign = "left";
    statusEl.style.padding = "20px";
    statusEl.style.fontSize = "12px";
    statusEl.innerText = `❌ เกิดข้อผิดพลาด\n\n${error.message}`;
  }
}

initAR();
