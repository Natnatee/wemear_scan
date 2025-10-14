import { convertToLegacyFormat } from "./utils/convertData.js";
import { sampleProjects } from "./make_data/sample_project2.js";
import util from "util";

//node src/test.js

const legacyData = convertToLegacyFormat(sampleProjects[0]);
console.log(util.inspect(legacyData, { depth: null, colors: true }));
