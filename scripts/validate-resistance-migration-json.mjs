import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(
  path.join(__dirname, "../supabase/migrations/012_working_with_resistance_note.sql"),
  "utf8"
);
const m = sql.match(/\$DOCJSON\$([\s\S]*)\$DOCJSON\$::jsonb/);
if (!m) throw new Error("Could not find DOCJSON dollar block");
JSON.parse(m[1]);
console.log("OK", m[1].length, "bytes JSON");
