import * as fs from "fs";
import * as path from "path";
function createEachPath(studentNumber: string, sid: number): string {
  const basePath = path.join("d:/unzips", studentNumber);
  const dirs = fs.readdirSync(basePath, { withFileTypes: true });

  for (const dir of dirs) {
    if (dir.isDirectory() && dir.name.includes("0" + sid)) {
      const sessionPath = path.join(basePath, dir.name);
      const createdPath = path.join(
        sessionPath,
        "kokonolabs-log-fv0" + sid,
        "ws-history"
      );
      return createdPath;
    }
  }
  throw new Error(`Error: Directory containing "0${sid}" not found.`);
}
const data = createEachPath("70110094", 1);
console.log(data);
