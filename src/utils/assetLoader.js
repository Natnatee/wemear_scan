import { fetchAndCacheAsset } from "./idbAsset.js";

/**
 * โหลด assets ทั้งหมดสำหรับ tracking mode
 * @param {Object} modeData - ข้อมูล tracking mode (เช่น image, face)
 * @param {string} trackingMode - ชื่อ mode ("image", "face", etc.)
 */
export async function loadAssets(modeData, trackingMode) {
  const progressBar = document.getElementById("progress");
  const statusText = document.getElementById("status");
  const progressText = document.getElementById("progress-text");
  const logoImg = document.getElementById("logo");
  const body = document.body;

  try {
    // ชั้นที่ 1: โหลด background + icon (ถ้ามี)
    statusText.innerText = "กำลังเตรียม UI...";
    await loadLightAssets(modeData.setting, logoImg, body);

    // ชั้นที่ 2: รวบรวม assets ทั้งหมดจาก tracks → scenes → assets
    const allAssets = collectAllAssets(modeData);

    if (allAssets.length === 0) {
      statusText.innerText = "ไม่มี assets ที่ต้องโหลด";
      progressBar.style.width = "100%";
      progressText.innerText = "100%";
      return;
    }

    statusText.innerText = `กำลังโหลด ${allAssets.length} ไฟล์...`;

    // โหลดทีละตัว พร้อม update progress bar
    for (let i = 0; i < allAssets.length; i++) {
      const asset = allAssets[i];

      try {
        statusText.innerText = `กำลังโหลด ${asset.asset_name || "Asset"} (${
          i + 1
        }/${allAssets.length})`;

        // ใช้ fetchAndCacheAsset ซึ่งจะเช็ค IndexedDB ก่อน แล้ว fallback ไป network
        await fetchAndCacheAsset(asset.src);

        // Update progress bar
        const percent = ((i + 1) / allAssets.length) * 100;
        progressBar.style.width = `${percent}%`;
        progressText.innerText = `${Math.round(percent)}%`;
      } catch (error) {
        // แจ้งเตือนแล้วทำต่อ
        console.warn(
          `⚠️ ไม่สามารถโหลด ${asset.asset_name || asset.src}:`,
          error
        );
      }
    }

    statusText.innerText = "✅ โหลดเสร็จสิ้น กำลังเตรียมพาคุณเข้าสู่ AR...";
  } catch (error) {
    console.error("Error in loadAssets:", error);
    statusText.innerText = "⚠️ เกิดข้อผิดพลาดบางส่วน แต่จะดำเนินการต่อ...";
  }
}

/**
 * โหลด assets เบาๆ (background, icon) สำหรับแสดง loading screen
 */
async function loadLightAssets(setting, logoImg, body) {
  // ใช้ default values
  const defaultBackground = "./public/background_default.jpg";
  const defaultIcon = "./public/icon_default.jpg";

  // ตั้งค่า background
  const backgroundSrc = setting?.background || defaultBackground;
  try {
    // Preload background image
    const bgImg = new Image();
    bgImg.src = backgroundSrc;
    await new Promise((resolve, reject) => {
      bgImg.onload = resolve;
      bgImg.onerror = reject;
    });
    body.style.backgroundImage = `url(${backgroundSrc})`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
  } catch (error) {
    console.warn("⚠️ ไม่สามารถโหลด background:", error);
    // ใช้ default
    body.style.backgroundImage = `url(${defaultBackground})`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
  }

  // ตั้งค่า icon/logo
  const iconSrc = setting?.icon || defaultIcon;
  try {
    // Preload icon
    const iconImg = new Image();
    iconImg.src = iconSrc;
    await new Promise((resolve, reject) => {
      iconImg.onload = resolve;
      iconImg.onerror = reject;
    });
    logoImg.src = iconSrc;
  } catch (error) {
    console.warn("⚠️ ไม่สามารถโหลด icon:", error);
    // ใช้ default
    logoImg.src = defaultIcon;
  }
}

/**
 * รวบรวม assets ทั้งหมดจาก tracks → scenes → assets
 * ไม่รวม mindFile (เพราะจะโหลดแบบ realtime)
 */
function collectAllAssets(modeData) {
  const assets = [];

  // ดึง assets จาก tracks → scenes → assets
  if (modeData.tracks && Array.isArray(modeData.tracks)) {
    modeData.tracks.forEach((track) => {
      if (track.scenes && Array.isArray(track.scenes)) {
        track.scenes.forEach((scene) => {
          if (scene.assets && Array.isArray(scene.assets)) {
            assets.push(...scene.assets);
          }
        });
      }
    });
  }

  // ไม่เอา mindFile เพราะจะโหลดแบบ realtime
  // Mind file จะถูกโหลดตอน render AR

  return assets;
}
