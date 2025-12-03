import * as SQLite from 'expo-sqlite';

export interface Task {
  id: number;
  note: string;
  date: string; // ISO 8601: "2024-12-03"
  time: string; // "09:25 AM"
  imageUris?: string[]; // Array of local file paths
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync('tasks.db');
    
    // Check if migration is needed
    const tableInfo = await db.getAllAsync<any>('PRAGMA table_info(tasks)');
    const hasOldColumn = tableInfo.some((col: any) => col.name === 'image_uri');
    const hasNewColumn = tableInfo.some((col: any) => col.name === 'image_uris');
    
    // Create tasks table with new schema
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        image_uris TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
      CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
    `);
    
    // Migrate old data if needed
    if (hasOldColumn && !hasNewColumn) {
      console.log('Migrating image_uri to image_uris...');
      await db.execAsync(`
        ALTER TABLE tasks ADD COLUMN image_uris TEXT;
        UPDATE tasks SET image_uris = 
          CASE 
            WHEN image_uri IS NOT NULL AND image_uri != '' 
            THEN json_array(image_uri)
            ELSE NULL
          END;
      `);
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
