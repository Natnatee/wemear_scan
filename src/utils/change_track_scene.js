/**
 * สร้างปุ่มสำหรับเปลี่ยน Scene
 * @param {Object} sceneButtonConfig - การตั้งค่าปุ่ม {show, src_left, src_right}
 */
export function createSceneButtons(sceneButtonConfig) {
  if (!sceneButtonConfig || !sceneButtonConfig.show) {
    return;
  }

  const { src_left, src_right } = sceneButtonConfig;

  // สร้างปุ่มซ้าย
  const leftButton = document.createElement("img");
  leftButton.className = "scene-button-left";
  leftButton.src = src_left;
  leftButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 60px;
    height: 60px;
    cursor: pointer;
    z-index: 9999;
    transition: transform 0.2s ease;
    display: none;
  `;

  // สร้างปุ่มขวา
  const rightButton = document.createElement("img");
  rightButton.className = "scene-button-right";
  rightButton.src = src_right;
  rightButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    cursor: pointer;
    z-index: 9999;
    transition: transform 0.2s ease;
    display: none;
  `;

  // เพิ่ม event listener สำหรับปุ่มซ้าย
  leftButton.addEventListener("click", () => {
    console.log("left");
    // Animation: ขยายและหดกลับ
    leftButton.style.transform = "scale(1.3)";
    setTimeout(() => {
      leftButton.style.transform = "scale(1)";
    }, 200);
  });

  // เพิ่ม event listener สำหรับปุ่มขวา
  rightButton.addEventListener("click", () => {
    console.log("right");
    // Animation: ขยายและหดกลับ
    rightButton.style.transform = "scale(1.3)";
    setTimeout(() => {
      rightButton.style.transform = "scale(1)";
    }, 200);
  });

  // เพิ่มปุ่มเข้าไปใน body
  document.body.appendChild(leftButton);
  document.body.appendChild(rightButton);

  console.log("✅ Scene buttons created");
}
