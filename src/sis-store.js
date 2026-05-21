import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createInitialState } from "./sis-services.js";

export class PersistentSisStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = null;
  }

  async load() {
    if (this.state) {
      return this.state;
    }

    try {
      const raw = await readFile(this.filePath, "utf8");
      this.state = JSON.parse(raw);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      this.state = createInitialState();
      await this.save(this.state);
    }

    return this.state;
  }

  async save(state) {
    this.state = state;
    await mkdir(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempPath, JSON.stringify(state, null, 2), "utf8");
    await rename(tempPath, this.filePath);
    return state;
  }

  async reset() {
    this.state = createInitialState();
    await this.save(this.state);
    return this.state;
  }
}
