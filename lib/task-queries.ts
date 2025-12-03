import { getDatabase, Task } from './database';

/**
 * Convert ISO date string to formatted time (e.g., "09:25 AM")
 */
function getCurrentTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Convert database row to Task object
 */
function rowToTask(row: any): Task {
  let imageUris: string[] | undefined;
  
  if (row.image_uris) {
    try {
      imageUris = JSON.parse(row.image_uris);
    } catch (e) {
      console.error('Failed to parse image_uris:', row.image_uris);
      imageUris = undefined;
    }
  }
  
  return {
    id: row.id,
    note: row.note,
    date: row.date,
    time: row.time,
    imageUris,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get all tasks from the database
 */
export async function getAllTasks(): Promise<Task[]> {
  const db = getDatabase();
  const result = await db.getAllAsync<any>('SELECT * FROM tasks ORDER BY date DESC, time DESC');
  return result.map(rowToTask);
}

/**
 * Get tasks within a date range
 */
export async function getTasksByDateRange(
  startDate: string,
  endDate: string
): Promise<Task[]> {
  const db = getDatabase();
  const result = await db.getAllAsync<any>(
    'SELECT * FROM tasks WHERE date >= ? AND date <= ? ORDER BY date DESC, time DESC',
    [startDate, endDate]
  );
  return result.map(rowToTask);
}

/**
 * Get tasks by specific date
 */
export async function getTasksByDate(date: string): Promise<Task[]> {
  const db = getDatabase();
  const result = await db.getAllAsync<any>(
    'SELECT * FROM tasks WHERE date = ? ORDER BY time DESC',
    [date]
  );
  return result.map(rowToTask);
}

/**
 * Create a new task
 */
export async function createTask(
  note: string,
  date: string,
  imageUris?: string[]
): Promise<Task> {
  const db = getDatabase();
  const now = new Date().toISOString();
  const time = getCurrentTimeString();
  
  const imageUrisJson = imageUris && imageUris.length > 0 
    ? JSON.stringify(imageUris) 
    : null;

  const result = await db.runAsync(
    `INSERT INTO tasks (note, date, time, image_uris, completed, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
    [note, date, time, imageUrisJson, now, now]
  );

  // Fetch the newly created task
  const newTask = await db.getFirstAsync<any>(
    'SELECT * FROM tasks WHERE id = ?',
    [result.lastInsertRowId]
  );

  if (!newTask) {
    throw new Error('Failed to create task');
  }

  return rowToTask(newTask);
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: number,
  updates: {
    note?: string;
    date?: string;
    imageUris?: string[] | null;
  }
): Promise<Task> {
  const db = getDatabase();
  const now = new Date().toISOString();

  // Build dynamic update query
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.note !== undefined) {
    fields.push('note = ?');
    values.push(updates.note);
  }
  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date);
  }
  if (updates.imageUris !== undefined) {
    fields.push('image_uris = ?');
    const imageUrisJson = updates.imageUris && updates.imageUris.length > 0
      ? JSON.stringify(updates.imageUris)
      : null;
    values.push(imageUrisJson);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  // Fetch the updated task
  const updatedTask = await db.getFirstAsync<any>(
    'SELECT * FROM tasks WHERE id = ?',
    [id]
  );

  if (!updatedTask) {
    throw new Error('Task not found');
  }

  return rowToTask(updatedTask);
}

/**
 * Delete a task
 */
export async function deleteTask(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(id: number): Promise<Task> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    'UPDATE tasks SET completed = NOT completed, updated_at = ? WHERE id = ?',
    [now, id]
  );

  // Fetch the updated task
  const updatedTask = await db.getFirstAsync<any>(
    'SELECT * FROM tasks WHERE id = ?',
    [id]
  );

  if (!updatedTask) {
    throw new Error('Task not found');
  }

  return rowToTask(updatedTask);
}

/**
 * Search tasks by note content
 */
export async function searchTasks(query: string): Promise<Task[]> {
  const db = getDatabase();
  const searchTerm = `%${query}%`;
  const result = await db.getAllAsync<any>(
    'SELECT * FROM tasks WHERE note LIKE ? ORDER BY date DESC, time DESC',
    [searchTerm]
  );
  return result.map(rowToTask);
}
