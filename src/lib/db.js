import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'db', 'db.json');

export function readDb() {
  const fileContent = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(fileContent);
}

export function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
