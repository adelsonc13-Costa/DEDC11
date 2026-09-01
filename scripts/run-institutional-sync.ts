import { runInstitutionalSync } from "../server/institutionalSync";

const result = await runInstitutionalSync();
console.log(JSON.stringify(result, null, 2));
