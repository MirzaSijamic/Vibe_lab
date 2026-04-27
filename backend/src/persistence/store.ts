import fs from "fs/promises";
import path from "path";
import { StoreData } from "../types";

const storePath = path.resolve(__dirname, "..", "..", "data", "store.json");

export const readStore = async (): Promise<StoreData> => {
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as StoreData;
};

export const writeStore = async (store: StoreData): Promise<void> => {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
};

export const withStore = async <T>(
  mutate: (store: StoreData) => Promise<T> | T,
): Promise<T> => {
  const store = await readStore();
  const result = await mutate(store);
  await writeStore(store);
  return result;
};
