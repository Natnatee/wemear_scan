import * as THREE from "three";

/**
 * Avatar class สำหรับจัดการ face blendshapes
 */
class Avatar {
  constructor() {
    this.gltf = null;
    this.morphTargetMeshes = [];
  }

  /**
   * โหลด GLTF model และเตรียม morph targets
   * @param {string} url - URL ของ GLTF model
   */
  async init(url) {
    const { GLTFLoader } = await import(
      "three/examples/jsm/loaders/GLTFLoader.js"
    );
    const gltf = await new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          resolve(gltf);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });

    gltf.scene.traverse((object) => {
      if (object.isBone && !this.root) {
        this.root = object;
      }
      if (!object.isMesh) return;

      const mesh = object;
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

      this.morphTargetMeshes.push(mesh);
    });

    this.gltf = gltf;
  }

  /**
   * อัพเดท blendshapes จาก MindAR estimate
   * @param {Object} blendshapes - Blendshapes data from MindAR
   */
  updateBlendshapes(blendshapes) {
    const categories = blendshapes.categories;
    let coefsMap = new Map();

    for (let i = 0; i < categories.length; ++i) {
      coefsMap.set(categories[i].categoryName, categories[i].score);
    }

    for (const mesh of this.morphTargetMeshes) {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
        continue;
      }

      for (const [name, value] of coefsMap) {
        if (!Object.keys(mesh.morphTargetDictionary).includes(name)) {
          continue;
        }

        const idx = mesh.morphTargetDictionary[name];
        mesh.morphTargetInfluences[idx] = value;
      }
    }
  }
}

/**
 * โหลด Face Avatar ที่รองรับ blendshapes
 * @param {Object} mindarThree - MindAR Three instance
 * @param {Array} assets - รายการ assets ที่จะโหลด
 * @param {Object} sceneData - ข้อมูล scene สำหรับเก็บ reference
 */
export async function loadFaceAvatar(mindarThree, assets, sceneData) {
  const { scene } = mindarThree;

  // เพิ่มไฟให้ scene
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);
  sceneData.lights.push(light);

  // สร้าง anchor
  const anchor = mindarThree.addAnchor(1);
  sceneData.anchorGroups = { avatar: anchor };

  // หา asset แรกที่เป็น GLB/GLTF
  const avatarAsset = assets.find(
    (asset) => asset.src.endsWith(".glb") || asset.src.endsWith(".gltf")
  );

  if (!avatarAsset) {
    console.error("No avatar model found in assets");
    return;
  }

  // สร้างและโหลด avatar
  const avatar = new Avatar();
  await avatar.init(avatarAsset.src);

  // ตั้งค่า scale, position, rotation จาก asset
  const scale = avatarAsset.scale || [2, 2, 2];
  const position = avatarAsset.position || [0, 0, 0];
  const rotation = avatarAsset.rotation || [0, 0, 0];

  avatar.gltf.scene.scale.set(...scale);
  avatar.gltf.scene.position.set(...position);
  avatar.gltf.scene.rotation.set(
    THREE.MathUtils.degToRad(rotation[0]),
    THREE.MathUtils.degToRad(rotation[1]),
    THREE.MathUtils.degToRad(rotation[2])
  );

  anchor.group.add(avatar.gltf.scene);

  // เก็บ avatar reference สำหรับใช้ใน animation loop
  sceneData.avatar = avatar;

  console.log("Face avatar with blendshapes loaded successfully");
}
