/**
 * ฟังก์ชันสำหรับตั้งค่า width/height ตาม aspect ratio ของ media
 */

/**
 * คำนวณและ return width/height สำหรับ a-image จาก texture ที่โหลดแล้ว
 * @returns Promise<{width: number, height: number}>
 */
export function setImageAspectRatio(imageElement) {
  return new Promise((resolve) => {
    imageElement.addEventListener("materialtextureloaded", (e) => {
      const texture = e.target.components.material.material.map;
      if (texture && texture.image) {
        const aspectRatio = texture.image.width / texture.image.height;
        resolve({ width: aspectRatio, height: 1 });
      } else {
        resolve({ width: 1, height: 1 });
      }
    });
  });
}

/**
 * คำนวณและ return width/height สำหรับ a-video จาก video element ที่โหลดแล้ว
 * @returns Promise<{width: number, height: number}>
 */
export function setVideoAspectRatio(videoElement, videoId) {
  return new Promise((resolve) => {
    videoElement.addEventListener("materialtextureloaded", (e) => {
      const videoAsset = document.getElementById(videoId);
      if (videoAsset && videoAsset.videoWidth && videoAsset.videoHeight) {
        const aspectRatio = videoAsset.videoWidth / videoAsset.videoHeight;
        resolve({ width: aspectRatio, height: 1 });
      } else {
        resolve({ width: 1, height: 1 });
      }
    });
  });
}
