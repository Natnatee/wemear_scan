/**
 * Utility functions for converting Three.js values to A-Frame format
 */

/**
 * แปลง Vector3 จาก Three.js เป็น string สำหรับ A-Frame
 * @param {Array|Object} vector - Vector3 ในรูปแบบ array หรือ object ที่มี x, y, z
 * @returns {string} ค่าในรูปแบบ string สำหรับ A-Frame
 */
export function convertVector3ToAframe(vector) {
  if (!vector) return "0 0 0";

  let x, y, z;

  if (Array.isArray(vector)) {
    [x, y, z] = vector;
  } else if (vector.x !== undefined && vector.y !== undefined && vector.z !== undefined) {
    x = vector.x;
    y = vector.y;
    z = vector.z;
  } else {
    return "0 0 0";
  }

  return `${x} ${y} ${z}`;
}

/**
 * แปลง rotation จากเรเดียนเป็นองศาและเป็น string สำหรับ A-Frame
 * @param {Array|Object} rotation - Rotation ในรูปแบบ array หรือ object ที่มี x, y, z (ในเรเดียน)
 * @returns {string} ค่าในรูปแบบ string สำหรับ A-Frame (องศา)
 */
export function convertRotationToAframe(rotation) {
  if (!rotation) return "0 0 0";

  let x, y, z;

  if (Array.isArray(rotation)) {
    [x, y, z] = rotation;
  } else if (rotation.x !== undefined && rotation.y !== undefined && rotation.z !== undefined) {
    x = rotation.x;
    y = rotation.y;
    z = rotation.z;
  } else {
    return "0 0 0";
  }

  // แปลงจากเรเดียนเป็นองศา
  const xDeg = (x * 180) / Math.PI;
  const yDeg = (y * 180) / Math.PI;
  const zDeg = (z * 180) / Math.PI;

  return `${xDeg} ${yDeg} ${zDeg}`;
}

/**
 * แปลง scale สำหรับ A-Frame (ปกติ scale ใน Three.js และ A-Frame จะใช้หน่วยเดียวกัน)
 * @param {Array|Object} scale - Scale ในรูปแบบ array หรือ object ที่มี x, y, z
 * @returns {string} ค่าในรูปแบบ string สำหรับ A-Frame
 */
export function convertScaleToAframe(scale) {
  return convertVector3ToAframe(scale);
}

/**
 * ฟังก์ชันหลักสำหรับแปลงค่าต่างๆ จาก Three.js เป็น A-Frame
 * @param {Array|Object} value - ค่าที่ต้องการแปลง
 * @param {string} type - ประเภทของค่าที่ต้องการแปลง ('position', 'rotation', 'scale')
 * @returns {string} ค่าในรูปแบบ string สำหรับ A-Frame
 */
export function convertToAframe(value, type = 'position') {
  if (!value) return "0 0 0";

  switch (type) {
    case 'rotation':
      return convertRotationToAframe(value);
    case 'scale':
      return convertScaleToAframe(value);
    case 'position':
    default:
      return convertVector3ToAframe(value);
  }
}
