/**
 * ฟังก์ชันสำหรับตั้งค่า width/height ตาม aspect ratio ของ media
 */

/**
 * ตั้งค่า width/height สำหรับ a-image จาก texture ที่โหลดแล้ว
 */
export function setImageAspectRatio(imageElement) {
  imageElement.addEventListener("materialtextureloaded", (e) => {
    const texture = e.target.components.material.material.map;
    if (texture && texture.image) {
      const aspectRatio = texture.image.width / texture.image.height;
      imageElement.setAttribute("width", aspectRatio);
      imageElement.setAttribute("height", 1);
    }
  });
}

/**
 * ตั้งค่า width/height สำหรับ a-video จาก video element ที่โหลดแล้ว
 */
export function setVideoAspectRatio(videoElement, videoId) {
  videoElement.addEventListener("materialtextureloaded", (e) => {
    const videoAsset = document.getElementById(videoId);
    if (videoAsset && videoAsset.videoWidth && videoAsset.videoHeight) {
      const aspectRatio = videoAsset.videoWidth / videoAsset.videoHeight;
      videoElement.setAttribute("width", aspectRatio);
      videoElement.setAttribute("height", 1);
    }
  });
}
