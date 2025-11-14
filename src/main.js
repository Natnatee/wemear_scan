/**
 * Main Router & Asset Loader
 *
 * Flow:
 * 1. Fetch project data from API (or use default)
 * 2. Save to localStorage
 * 3. Detect tracking mode (image, face, etc.)
 * 4. Load all assets to IndexedDB
 * 5. Redirect to tracking page
 */
import { project_info } from "./make_data/project_info_face.js";
import { loadAssets } from "./utils/assetLoader.js";

const SUPABASE_URL = "https://supabase.wemear.com/rest/v1/project_info";
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
  const url = `${SUPABASE_URL}?project_id=eq.${projectId}`;

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

  if (!data || data.length === 0) {
    throw new Error(`Project not found with ID: ${projectId}\nURL: ${url}`);
  }

  // ข้อมูลจาก project_info API มีโครงสร้างตรงกับ project_info.js
  return data[0];
}

/**
 * Main initialization function
 */
async function init() {
  try {
    const statusEl = document.getElementById("status");

    // 1. ดึง project_id จาก URL
    const projectId = getProjectIdFromUrl();
    console.log("Project ID from URL:", projectId);

    // 2. Fetch project data (with fallback to default)
    let projectData;
    try {
      if (!projectId) {
        throw new Error("No project_id in URL");
      }

      statusEl.innerText = `กำลังโหลดข้อมูลโปรเจค...\nProject ID: ${projectId}`;
      projectData = await fetchProjectData(projectId);
      console.log("✅ Project Data fetched:", projectData);
    } catch (error) {
      // Fallback to default data
      console.warn("⚠️ ไม่สามารถโหลดข้อมูลจาก API:", error.message);
      alert("⚠️ ไม่สามารถโหลดข้อมูลโปรเจคได้\nจะใช้ข้อมูลตัวอย่างแทน");

      projectData = project_info[0];
      console.log("📦 Using default project data:", projectData);
    }

    // 3. บันทึกลง localStorage (ใหม่ทุกครั้ง)
    localStorage.setItem("projectData", JSON.stringify(projectData));
    console.log("💾 Saved to localStorage");

    // 4. ตรวจสอบ tracking mode (key แรกใน tracking_modes)
    const trackingModes = projectData.info?.tracking_modes;
    if (!trackingModes) {
      throw new Error("ไม่พบข้อมูล tracking_modes ในโปรเจค");
    }

    const trackingMode = Object.keys(trackingModes)[0]; // เช่น "image" หรือ "face"
    console.log("🎯 Tracking Mode:", trackingMode);

    const modeData = trackingModes[trackingMode];

    // 5. โหลด assets ทั้งหมด
    statusEl.innerText = "กำลังเตรียมโหลด assets...";
    await loadAssets(modeData, trackingMode);

    // 6. Redirect ไปหน้า tracking
    statusEl.innerText = `🚀 กำลังพาคุณไปยังหน้า ${trackingMode}...`;

    setTimeout(() => {
      window.location.href = `/${trackingMode}.html`;
    }, 1000);
  } catch (error) {
    console.error("❌ Fatal error:", error);

    const statusEl = document.getElementById("status");
    statusEl.style.whiteSpace = "pre-wrap";
    statusEl.style.textAlign = "left";
    statusEl.style.padding = "20px";
    statusEl.style.fontSize = "12px";
    statusEl.innerText = `❌ เกิดข้อผิดพลาด\n\n${error.message}`;
  }
}

// เริ่มทำงาน
init();
