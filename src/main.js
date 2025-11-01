/**
 * Utility functions for converting Three.js values to A-Frame format
 */
import { renderImageTracking } from "./image_tracking.js";
/**
 * Data format conversion utilities
 */
import { convertToLegacyFormat } from "./utils/convertData2.js";

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
 * รอให้ A-Frame และ MindAR โหลดเสร็จ
 */
function waitForLibraries() {
  return new Promise((resolve) => {
    // ตรวจสอบว่า AFRAME และ MindAR โหลดเสร็จแล้วหรือยัง
    const checkLibraries = setInterval(() => {
      if (window.AFRAME && window.MINDAR && window.MINDAR.IMAGE) {
        clearInterval(checkLibraries);
        console.log("A-Frame and MindAR loaded successfully");
        resolve();
      }
    }, 100);
  });
}

async function initAR() {
  try {
    // รอให้ libraries โหลดเสร็จก่อน
    document.getElementById("status").innerText = "กำลังโหลด AR libraries...";
    await waitForLibraries();

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

    await renderImageTracking({
      targets,
      mindFile,
      onReady: () => {
        document.getElementById("status").innerText = "AR พร้อมใช้งาน!";
      },
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
