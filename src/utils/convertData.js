/**
 * Utility functions for converting new data format to legacy format
 */

/**
 * แปลงข้อมูลจากรูปแบบใหม่ (sample_project2.js) เป็นรูปแบบเก่า (makedata.js)
 * @param {Object} newData - ข้อมูลรูปแบบใหม่จาก sample_project2.js
 * @returns {Object} ข้อมูลรูปแบบเก่า
 */
export function convertToLegacyFormat(newData) {
  const project = newData;
  const trackingModes = project.info.tracking_modes;

  // สร้าง asset mapping จาก shared_assets
  const assetMap = new Map();
  if (project.info.shared_assets) {
    project.info.shared_assets.forEach(asset => {
      assetMap.set(asset.asset_name, asset);
    });
  }

  // โฟกัสที่ image tracking mode
  if (!trackingModes.image) {
    throw new Error("No image tracking mode found");
  }

  const imageTracking = trackingModes.image;

  // สร้างโครงสร้างข้อมูลเก่า
  const legacyData = {
    "image tracking": {},
    mindFile: imageTracking.mindFile.src
  };

  // แปลงแต่ละ track เป็น target ในรูปแบบเก่า
  imageTracking.tracks.forEach((track, trackIndex) => {
    const targetKey = `target${trackIndex}`;

    // โฟกัสที่ scene แรก (S1) ก่อน
    const firstScene = track.scenes.find(scene => scene.scene_id === "S1");
    if (!firstScene) return;

    // แปลงแต่ละ asset ใน scene
    const convertedAssets = firstScene.assets.map(asset => {
      // แมพ asset_name กับข้อมูลจาก shared_assets
      const assetInfo = assetMap.get(asset.asset_name);
      if (!assetInfo) {
        console.warn(`Asset not found: ${asset.asset_name}`);
        return null;
      }

      // สร้าง object ในรูปแบบเก่า
      const convertedAsset = {
        src: assetInfo.src,
        type: assetInfo.type,
        scale: asset.scale,
        position: asset.position,
        rotation: asset.rotation,
        action: asset.action
      };

      // เพิ่ม properties เพิ่มเติมสำหรับ video
      if (assetInfo.type === "Video") {
        convertedAsset.loop = asset.loop;
        convertedAsset.muted = asset.muted;
        convertedAsset.autoplay = asset.autoplay;
      }

      // เพิ่ม properties เพิ่มเติมสำหรับ image
      if (assetInfo.type === "Image") {
        convertedAsset.opacity = asset.opacity;
      }

      return convertedAsset;
    }).filter(asset => asset !== null); // กรอง asset ที่ไม่พบออก

    legacyData["image tracking"][targetKey] = convertedAssets;
  });

  return legacyData;
}
