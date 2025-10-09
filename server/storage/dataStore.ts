import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AppData, StoredUser } from "../types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIRECTORY = path.resolve(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIRECTORY, "no-skills-data.json");

const defaultData: AppData = {
  users: [],
  generalMessages: [],
  directMessages: [],
  logs: [],
};

let cachedData: AppData | null = null;
let writeInFlight: Promise<void> | null = null;

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}

export async function loadData(): Promise<AppData> {
  if (cachedData) {
    return cachedData;
  }

  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  cachedData = JSON.parse(raw) as AppData;
  return cachedData;
}

export async function saveData(data: AppData): Promise<void> {
  cachedData = data;
  const write = (async () => {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  })();

  writeInFlight = write;
  await write;
  writeInFlight = null;
}

export async function withData<T>(mutator: (mutable: AppData) => T | Promise<T>): Promise<T> {
  const data = await loadData();
  const cloned: AppData = JSON.parse(JSON.stringify(data));
  const result = await mutator(cloned);
  await saveData(cloned);
  return result;
}

export function cloneUser(user: StoredUser): StoredUser {
  return JSON.parse(JSON.stringify(user)) as StoredUser;
}

export async function waitForWrites(): Promise<void> {
  if (writeInFlight) {
    await writeInFlight;
  }
}
