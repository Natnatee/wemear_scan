/**
 * ฟังก์ชันสำหรับตั้งค่า width/height ตาม aspect ratio ของ media
 */

// Helper: คำนวณและ resolve aspect ratio
const resolveAspect = (width, height, resolve, label = "") => {
  if (width && height) {
    const aspectRatio = width / height;
    console.log(`${label} aspect:`, width, "x", height, "=", aspectRatio);
    resolve({ width: aspectRatio, height: 1 });
    return true;
  }
  return false;
};

/**
 * คำนวณและ return width/height สำหรับ a-image จาก texture ที่โหลดแล้ว
 */
export function setImageAspectRatio(imageElement) {
  return new Promise((resolve) => {
    const tryTexture = () => {
      const texture = imageElement.components?.material?.material?.map;
      return (
        texture?.image &&
        resolveAspect(
          texture.image.width,
          texture.image.height,
          resolve,
          "Image"
        )
      );
    };

    const tryDirectLoad = () => {
      const src = imageElement.getAttribute("src");
      if (!src) return resolve({ width: 1, height: 1 });

      const img = new Image();
      img.onload = () =>
        resolveAspect(img.width, img.height, resolve, "Image (direct)");
      img.onerror = () => resolve({ width: 1, height: 1 });
      img.src = src;
    };

    if (tryTexture()) return;

    const timeoutId = setTimeout(tryDirectLoad, 3000);
    imageElement.addEventListener("materialtextureloaded", () => {
      clearTimeout(timeoutId);
      if (!tryTexture()) tryDirectLoad();
    });
  });
}

/**
 * คำนวณและ return width/height สำหรับ a-video จาก video element ที่โหลดแล้ว
 */
export function setVideoAspectRatio(videoElement, videoId) {
  return new Promise((resolve) => {
    const videoAsset = document.getElementById(videoId);
    if (!videoAsset) return resolve({ width: 1, height: 1 });

    const tryCalculate = () =>
      resolveAspect(
        videoAsset.videoWidth,
        videoAsset.videoHeight,
        resolve,
        `Video ${videoId}`
      );

    if (tryCalculate()) return;

    videoAsset.addEventListener("loadedmetadata", tryCalculate, { once: true });
    setTimeout(() => !tryCalculate() && resolve({ width: 1, height: 1 }), 3000);
  });
}
