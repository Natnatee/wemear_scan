import * as THREE from "three";

/**
 * ทำความสะอาด THREE.js objects เพื่อป้องกัน memory leaks
 */
export const disposeObject3D = (object) => {
  if (!object) return;

  // Dispose geometry
  if (object.geometry) {
    object.geometry.dispose();
  }

  // Dispose material(s)
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach((material) => disposeMaterial(material));
    } else {
      disposeMaterial(object.material);
    }
  }

  // Recursively dispose children
  if (object.children) {
    object.children.forEach((child) => disposeObject3D(child));
  }
};

/**
 * ทำความสะอาด Material และ Textures
 */
const disposeMaterial = (material) => {
  if (!material) return;

  // Dispose textures
  Object.keys(material).forEach((key) => {
    if (material[key] && material[key].isTexture) {
      material[key].dispose();
    }
  });

  material.dispose();
};

/**
 * ลบ DOM elements ที่เกี่ยวข้องกับ scene
 */
export const removeUIElements = (classNames = []) => {
  classNames.forEach((className) => {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach((el) => el.remove());
  });
};

/**
 * ทำความสะอาด anchor groups ทั้งหมด
 */
export const clearAnchors = (anchorGroups) => {
  if (!anchorGroups) return;

  Object.values(anchorGroups).forEach((anchor) => {
    if (anchor && anchor.group) {
      // Remove all children from anchor group
      while (anchor.group.children.length > 0) {
        const child = anchor.group.children[0];
        disposeObject3D(child);
        anchor.group.remove(child);
      }
    }
  });
};

/**
 * ทำความสะอาด face mesh
 */
export const clearFaceMesh = (scene) => {
  if (!scene) return;

  // Find and remove face mesh objects
  const objectsToRemove = [];
  scene.traverse((object) => {
    if (object.isMesh && object.geometry && object.geometry.isBufferGeometry) {
      // Check if it's a face mesh (usually has specific vertex count)
      objectsToRemove.push(object);
    }
  });

  objectsToRemove.forEach((obj) => {
    disposeObject3D(obj);
    scene.remove(obj);
  });
};

/**
 * ทำความสเอาด lights ทั้งหมดที่เพิ่มโดย scene
 */
export const clearLights = (lights) => {
  if (!lights || !Array.isArray(lights)) return;

  lights.forEach((light) => {
    if (light && light.parent) {
      light.parent.remove(light);
      if (light.dispose) {
        light.dispose();
      }
    }
  });
};
