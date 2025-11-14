import * as THREE from "three";
import { MindARThree } from "./src_mindar/face-target/three";

// ดึง projectData จาก localStorage
const getProjectData = () => {
  const data = localStorage.getItem("projectData");
  if (!data) {
    console.error("No projectData found in localStorage");
    return null;
  }
  return JSON.parse(data);
};

// สร้าง UI สำหรับเลือกของสวมใส่
const createUI = (assets, modelsMap) => {
  // สร้าง options panel
  const panel = document.createElement("div");
  panel.className = "options-panel";
  panel.style.cssText = `
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    z-index: 2;
    gap: 5px;
    padding: 10px;
  `;

  // เก็บ items ที่ไม่ซ้ำกัน (ใช้ asset_name ตรงๆ ไม่ต้องตัด)
  const uniqueItems = {};
  assets.forEach((asset) => {
    if (
      !asset.mindar_face_occluder &&
      asset.src_thumbnail &&
      asset.asset_name
    ) {
      // ใช้ asset_name เป็น key โดยตรง แต่กรอง _left และ _right ออก
      let itemKey = asset.asset_name;
      if (itemKey.endsWith("_left") || itemKey.endsWith("_right")) {
        itemKey = "earring"; // รวม earring_left และ earring_right เป็น earring
      }

      if (!uniqueItems[itemKey]) {
        uniqueItems[itemKey] = {
          thumbnail: asset.src_thumbnail,
          name: itemKey,
          visible: asset.visible !== undefined ? asset.visible : true,
        };
      }
    }
  });

  // สร้างปุ่มสำหรับแต่ละ item
  Object.entries(uniqueItems).forEach(([itemKey, item]) => {
    const button = document.createElement("img");
    button.src = item.thumbnail;
    button.style.cssText = `
      border: solid 2px;
      width: 50px;
      height: 50px;
      object-fit: cover;
      cursor: pointer;
      border-color: ${item.visible ? "green" : "#ccc"};
    `;

    // Toggle visibility เมื่อคลิก
    button.addEventListener("click", () => {
      item.visible = !item.visible;
      button.style.borderColor = item.visible ? "green" : "#ccc";

      // Toggle models ที่เกี่ยวข้อง
      if (modelsMap[itemKey]) {
        modelsMap[itemKey].forEach((model) => {
          model.visible = item.visible;
        });
      }
    });

    panel.appendChild(button);
  });

  document.body.appendChild(panel);
};

// สร้าง Face Mesh แบบ texture
const createFaceMesh = async (mindarThree, assets) => {
  const { scene } = mindarThree;

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const faceMesh = mindarThree.addFaceMesh();

  if (assets && assets.length > 0) {
    const textureAsset = assets[0];
    const texture = new THREE.TextureLoader().load(textureAsset.src);
    faceMesh.material.map = texture;
    faceMesh.material.transparent = true;
    faceMesh.material.needsUpdate = true;
  }

  scene.add(faceMesh);
};

// สร้าง Face Items แบบ 3D models
const createFaceItems = async (mindarThree, assets) => {
  const { scene, renderer, camera } = mindarThree;

  // ตั้งค่า renderer สำหรับ color management
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  // เพิ่ม lighting ที่เหมาะสมกับ PBR materials
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  // โหลด GLTF Loader
  const { GLTFLoader } = await import(
    "three/examples/jsm/loaders/GLTFLoader.js"
  );
  const loader = new GLTFLoader();

  // สร้าง anchor groups สำหรับแต่ละ anchorIndex
  const anchorGroups = {};
  const modelsMap = {}; // เก็บ models ตาม asset_name

  // โหลดและเพิ่ม assets
  for (const asset of assets) {
    const anchorIndex = asset.anchorIndex;

    // สร้าง anchor group ถ้ายังไม่มี
    if (!anchorGroups[anchorIndex]) {
      const anchor = mindarThree.addAnchor(anchorIndex);
      anchorGroups[anchorIndex] = anchor;
    }

    try {
      // โหลด GLTF model
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          asset.src,
          (gltf) => resolve(gltf),
          undefined,
          (error) => reject(error)
        );
      });

      const model = gltf.scene;

      // ตั้งค่า position, rotation, scale
      if (asset.position) {
        model.position.set(
          asset.position[0],
          asset.position[1],
          asset.position[2]
        );
      }
      if (asset.rotation) {
        model.rotation.set(
          THREE.MathUtils.degToRad(asset.rotation[0]),
          THREE.MathUtils.degToRad(asset.rotation[1]),
          THREE.MathUtils.degToRad(asset.rotation[2])
        );
      }
      if (asset.scale) {
        model.scale.set(asset.scale[0], asset.scale[1], asset.scale[2]);
      }

      // ตั้งค่า visibility
      model.visible = asset.visible !== undefined ? asset.visible : true;

      // เก็บ reference สำหรับการ toggle visibility ภายหลัง
      model.userData.assetId = asset.asset_id;
      model.userData.assetName = asset.asset_name;

      // ถ้าเป็น head occluder ให้ตั้งค่าพิเศษ
      if (asset.mindar_face_occluder) {
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.colorWrite = false;
            child.renderOrder = 0;
          }
        });
      }

      anchorGroups[anchorIndex].group.add(model);

      // เก็บ model ไว้ใน map (สำหรับ items ที่ไม่ใช่ head occluder)
      if (!asset.mindar_face_occluder && asset.asset_name) {
        // ใช้ asset_name เป็น key โดยตรง แต่รวม earring_left/right เป็น earring
        let itemKey = asset.asset_name;
        if (itemKey.endsWith("_left") || itemKey.endsWith("_right")) {
          itemKey = "earring";
        }

        if (!modelsMap[itemKey]) {
          modelsMap[itemKey] = [];
        }
        modelsMap[itemKey].push(model);
      }
    } catch (error) {
      console.error(`Error loading model ${asset.src}:`, error);
    }
  }

  return { anchorGroups, modelsMap };
};

// ฟังก์ชันหลักในการ render
export const initFaceTracking = async (container) => {
  const projectData = getProjectData();

  if (!projectData || !projectData.info) {
    console.error("Invalid project data");
    return;
  }

  const faceTracking = projectData.info.tracking_modes?.face;
  if (
    !faceTracking ||
    !faceTracking.scenes ||
    faceTracking.scenes.length === 0
  ) {
    console.error("No face tracking scenes found");
    return;
  }

  // ดึง scene แรก
  const firstScene = faceTracking.scenes[0];
  const sceneType = firstScene.scene_type;
  const assets = firstScene.assets || [];

  // สร้าง MindAR instance
  const mindarThree = new MindARThree({
    container: container || document.querySelector("#container"),
  });

  const { renderer, scene, camera } = mindarThree;

  // เลือก logic ตาม scene_type
  if (sceneType === "face_mesh") {
    await createFaceMesh(mindarThree, assets);
  } else if (sceneType === "face_item") {
    const { modelsMap } = await createFaceItems(mindarThree, assets);

    // สร้าง UI สำหรับเลือกของสวมใส่
    createUI(assets, modelsMap);
  } else {
    console.warn(`Unknown scene_type: ${sceneType}`);
  }

  // เริ่มต้น MindAR
  await mindarThree.start();

  // Animation loop
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  return mindarThree;
};

// สำหรับการใช้งานใน HTML
if (typeof window !== "undefined") {
  window.initFaceTracking = initFaceTracking;
}
