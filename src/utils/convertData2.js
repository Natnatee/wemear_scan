/**
 * Utility functions for converting new data format (without shared_assets) to legacy format
 */

/**
 * แปลงข้อมูลจากรูปแบบใหม่ (make_project_no_share_asset.js) เป็นรูปแบบเก่า (makedata.js)
 * @param {Object} newData - ข้อมูลรูปแบบใหม่ที่ asset อยู่ใน scene โดยตรง (ไม่มี shared_assets)
 * @returns {Object} ข้อมูลรูปแบบเก่า
 */
export function convertToLegacyFormat(newData) {
  const project = newData;
  const trackingModes = project.info.tracking_modes;

  // โฟกัสที่ image tracking mode
  if (!trackingModes.image) {
    throw new Error("No image tracking mode found");
  }

  const imageTracking = trackingModes.image;

  // สร้างโครงสร้างข้อมูลเก่า
  const legacyData = {
    "image tracking": {},
    mindFile: imageTracking.mindFile.mind_src,
  };

  // แปลงแต่ละ track เป็น target ในรูปแบบเก่า
  imageTracking.tracks.forEach((track, trackIndex) => {
    const targetKey = `target${trackIndex}`;

    // โฟกัสที่ scene แรก (S1) ก่อน
    const firstScene = track.scenes.find((scene) => scene.scene_id === "S1");
    if (!firstScene) return;

    // แปลงแต่ละ asset ใน scene โดยตรง (ไม่ต้อง map กับ shared_assets)
    const convertedAssets = firstScene.assets.map((asset) => {
      // สร้าง object ในรูปแบบเก่า โดยใช้ข้อมูลจาก asset โดยตรง
      const convertedAsset = {
        src: asset.src,
        type: asset.type,
        scale: asset.scale,
        position: asset.position,
        rotation: asset.rotation,
      };

      // เพิ่ม action ถ้ามี
      if (asset.action) {
        convertedAsset.action = asset.action;
      }

      // เพิ่ม properties เพิ่มเติมสำหรับ video
      if (asset.type === "Video") {
        convertedAsset.loop = asset.loop;
        convertedAsset.muted = asset.muted;
        convertedAsset.autoplay = asset.autoplay;
      }

      // เพิ่ม properties เพิ่มเติมสำหรับ image
      if (asset.type === "Image") {
        convertedAsset.opacity = asset.opacity;
      }

      return convertedAsset;
    });

    legacyData["image tracking"][targetKey] = convertedAssets;
  });

  return legacyData;
}
