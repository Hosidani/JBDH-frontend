import { getDb } from './db';

export class SettingsService {
  static async get(key: string): Promise<string | undefined> {
    const db = await getDb();
    const record = await db.get('settings', key);
    return record?.value;
  }

  static async set(key: string, value: string): Promise<void> {
    const db = await getDb();
    await db.put('settings', { key, value });
  }

  static async delete(key: string): Promise<void> {
    const db = await getDb();
    await db.delete('settings', key);
  }
}
