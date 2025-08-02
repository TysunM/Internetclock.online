export interface IStorage {
  // Basic storage interface for future expansion
}

class MemoryStorage implements IStorage {
  constructor() {}
}

export const storage = new MemoryStorage();
