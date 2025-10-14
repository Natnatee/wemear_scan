import { convertToLegacyFormat } from "./utils/convertData.js";
import { sampleProjects } from "./make_data/sample_project2.js";

const legacyData = convertToLegacyFormat(sampleProjects[0]);
console.log(legacyData);
