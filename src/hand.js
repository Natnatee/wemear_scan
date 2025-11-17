// hand.js - Hand Tracking Module

// เส้นเชื่อมต่อของมือ
const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // นิ้วหัวแม่มือ
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // นิ้วชี้
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12], // นิ้วกลาง
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16], // นิ้วนาง
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20], // นิ้วก้อย
  [5, 9],
  [9, 13],
  [13, 17], // ฝ่ามือ
];

// ตัวแปรสำหรับตรวจจับการปัดมือ
let previousHandX = null;
let swipeStartX = null;
let swipeStartTime = null;
const SWIPE_THRESHOLD = 0.15; // ระยะทางขั้นต่ำในการปัด (15% ของความกว้างหน้าจอ)
const SWIPE_TIME_THRESHOLD = 500; // เวลาสูงสุดในการปัด (milliseconds)
const SWIPE_COOLDOWN = 1000; // เวลารอระหว่างการตรวจจับปัด (milliseconds)
let lastSwipeTime = 0;

// ฟังก์ชันวาดเส้นเชื่อมต่อ
const drawConnectors = (ctx, canvas, landmarks, connections, color) => {
  connections.forEach((connection) => {
    const start = landmarks[connection[0]];
    const end = landmarks[connection[1]];

    ctx.beginPath();
    ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
    ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  });
};

// ฟังก์ชันวาดจุด
const drawLandmarks = (ctx, canvas, landmarks, color) => {
  landmarks.forEach((landmark) => {
    ctx.beginPath();
    ctx.arc(
      landmark.x * canvas.width,
      landmark.y * canvas.height,
      5,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
};

// ฟังก์ชันตรวจจับการปัดมือ
const detectSwipe = (landmarks) => {
  const currentTime = Date.now();

  // ใช้ตำแหน่งข้อมือ (landmark 0) เป็นจุดอ้างอิง
  const wrist = landmarks[0];
  const currentX = wrist.x;

  // เริ่มต้นการปัด
  if (previousHandX === null) {
    previousHandX = currentX;
    swipeStartX = currentX;
    swipeStartTime = currentTime;
    return;
  }

  // คำนวณระยะทางที่เคลื่อนไหว
  const deltaX = currentX - swipeStartX;
  const timeDelta = currentTime - swipeStartTime;

  // ตรวจจับการปัดขวา (เคลื่อนจากซ้ายไปขวา)
  if (
    deltaX > SWIPE_THRESHOLD &&
    timeDelta < SWIPE_TIME_THRESHOLD &&
    currentTime - lastSwipeTime > SWIPE_COOLDOWN
  ) {
    console.log("right");
    lastSwipeTime = currentTime;
    // รีเซ็ตค่า
    swipeStartX = currentX;
    swipeStartTime = currentTime;
  }
  // ตรวจจับการปัดซ้าย (เคลื่อนจากขวาไปซ้าย)
  else if (
    deltaX < -SWIPE_THRESHOLD &&
    timeDelta < SWIPE_TIME_THRESHOLD &&
    currentTime - lastSwipeTime > SWIPE_COOLDOWN
  ) {
    console.log("left");
    lastSwipeTime = currentTime;
    // รีเซ็ตค่า
    swipeStartX = currentX;
    swipeStartTime = currentTime;
  }

  // รีเซ็ตถ้าเวลาเกินกำหนด
  if (timeDelta > SWIPE_TIME_THRESHOLD) {
    swipeStartX = currentX;
    swipeStartTime = currentTime;
  }

  previousHandX = currentX;
};

// ฟังก์ชันหลักสำหรับเริ่ม Hand Tracking
export const initHandTracking = async (videoElement) => {
  if (!videoElement) {
    console.error("Video element not found for hand tracking");
    return null;
  }

  // สร้าง canvas สำหรับวาดมือ
  const handCanvas = document.createElement("canvas");
  handCanvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
    transform: scaleX(-1);
  `;
  document.body.appendChild(handCanvas);

  const canvasCtx = handCanvas.getContext("2d");

  // ตั้งค่า MediaPipe Hands
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  // กำหนด callback เมื่อตรวจจับมือได้
  hands.onResults((results) => {
    // ตั้งค่าขนาด canvas
    if (handCanvas.width !== videoElement.videoWidth) {
      handCanvas.width = videoElement.videoWidth;
      handCanvas.height = videoElement.videoHeight;
    }

    // ล้าง canvas
    canvasCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);

    // วาดมือถ้าตรวจจับได้
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      results.multiHandLandmarks.forEach((landmarks, index) => {
        const handedness = results.multiHandedness[index].label;
        const isRight = handedness === "Right";
        const mainColor = isRight ? "#00ff00" : "#ff00ff";
        const lightColor = isRight ? "#88ff88" : "#ff88ff";

        // ตรวจจับการปัดมือ
        detectSwipe(landmarks);

        // วาดเส้นและจุด
        drawConnectors(
          canvasCtx,
          handCanvas,
          landmarks,
          HAND_CONNECTIONS,
          mainColor
        );
        drawLandmarks(canvasCtx, handCanvas, landmarks, lightColor);

        // แสดงข้อความมือซ้าย/ขวา
        const wrist = landmarks[0];
        canvasCtx.fillStyle = mainColor;
        canvasCtx.font = "bold 20px Arial";
        canvasCtx.fillText(
          isRight ? "มือขวา" : "มือซ้าย",
          wrist.x * handCanvas.width,
          wrist.y * handCanvas.height - 20
        );
      });
    }
  });

  // เริ่มประมวลผล hand detection
  const processHands = async () => {
    if (videoElement.readyState >= 2) {
      await hands.send({ image: videoElement });
    }
    requestAnimationFrame(processHands);
  };
  processHands();

  console.log("✅ Hand tracking initialized successfully");

  return {
    hands,
    canvas: handCanvas,
    stop: () => {
      hands.close();
      handCanvas.remove();
      console.log("🛑 Hand tracking stopped");
    },
  };
};

// Export สำหรับใช้งานใน HTML (ถ้าต้องการ)
if (typeof window !== "undefined") {
  window.initHandTracking = initHandTracking;
}
