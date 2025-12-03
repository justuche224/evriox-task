import { Task } from '@/lib/database';
import { deleteImage } from '@/lib/image-service';
import * as TaskQueries from '@/lib/task-queries';
import { create } from 'zustand';

export interface TimelineDay {
  day: number;
  month: string;
  isCurrent?: boolean;
  tasks: Task[];
}

interface TaskStore {
  // State
  tasks: Task[];
  isLoading: boolean;
  searchText: string;
  selectedDate: Date | null;
  isModalOpen: boolean;
  editingTask: Task | null;
  isCalendarOpen: boolean;

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (note: string, date: string, imageUris?: string[]) => Promise<void>;
  updateTask: (id: number, updates: { note?: string; date?: string; imageUris?: string[] | null }) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleCompletion: (id: number) => Promise<void>;
  setSearchText: (text: string) => void;
  setSelectedDate: (date: Date | null) => void;
  openModal: (task?: Task) => void;
  closeModal: () => void;
  openCalendar: () => void;
  closeCalendar: () => void;

  // Computed
  getFilteredTasks: () => Task[];
  getTimelineData: () => TimelineDay[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  isLoading: false,
  searchText: '',
  selectedDate: null,
  isModalOpen: false,
  editingTask: null,
  isCalendarOpen: false,

  // Load all tasks from SQLite
  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await TaskQueries.getAllTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Error loading tasks:', error);
      set({ isLoading: false });
    }
  },

  // Add a new task
  addTask: async (note: string, date: string, imageUris?: string[]) => {
    try {
      const newTask = await TaskQueries.createTask(note, date, imageUris);
      set((state) => ({
        tasks: [newTask, ...state.tasks],
      }));
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  // Update an existing task
  updateTask: async (id: number, updates) => {
    try {
      // Get the current task to check if images are being replaced
      const currentTask = get().tasks.find((t) => t.id === id);
      
      // If replacing images, delete the old ones
      if (currentTask?.imageUris && updates.imageUris !== undefined) {
        // Delete old images that are not in the new list
        const newUris = updates.imageUris || [];
        const oldUris = currentTask.imageUris;
        
        for (const oldUri of oldUris) {
          if (!newUris.includes(oldUri)) {
            await deleteImage(oldUri);
          }
        }
      }

      const updatedTask = await TaskQueries.updateTask(id, updates);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (id: number) => {
    try {
      // Find the task to get its image URIs
      const task = get().tasks.find((t) => t.id === id);
      
      // Delete from database
      await TaskQueries.deleteTask(id);
      
      // Delete associated images if exist
      if (task?.imageUris) {
        for (const imageUri of task.imageUris) {
          await deleteImage(imageUri);
        }
      }

      // Update state
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Toggle task completion
  toggleCompletion: async (id: number) => {
    try {
      const updatedTask = await TaskQueries.toggleTaskCompletion(id);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      console.error('Error toggling completion:', error);
      throw error;
    }
  },

  // Set search text filter
  setSearchText: (text: string) => {
    set({ searchText: text });
  },

  // Set date filter
  setSelectedDate: (date: Date | null) => {
    set({ selectedDate: date });
  },

  // Open modal for create or edit
  openModal: (task?: Task) => {
    set({ isModalOpen: true, editingTask: task || null });
  },

  // Close modal
  closeModal: () => {
    set({ isModalOpen: false, editingTask: null });
  },

  // Open calendar
  openCalendar: () => {
    set({ isCalendarOpen: true });
  },

  // Close calendar
  closeCalendar: () => {
    set({ isCalendarOpen: false });
  },

  // Get filtered tasks based on search and date
  getFilteredTasks: () => {
    const { tasks, searchText, selectedDate } = get();
    
    return tasks.filter((task) => {
      // Search filter
      if (searchText && !task.note.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }

      // Date filter
      if (selectedDate) {
        const taskDate = new Date(task.date).toDateString();
        const filterDate = selectedDate.toDateString();
        if (taskDate !== filterDate) {
          return false;
        }
      }

      return true;
    });
  },

  // Transform tasks into timeline format
  getTimelineData: () => {
    const filteredTasks = get().getFilteredTasks();
    
    // Group tasks by date
    const tasksByDate = new Map<string, Task[]>();
    
    filteredTasks.forEach((task) => {
      const date = task.date;
      if (!tasksByDate.has(date)) {
        tasksByDate.set(date, []);
      }
      tasksByDate.get(date)!.push(task);
    });

    // Get current date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Find the min and max dates to fill gaps
    const allDates = Array.from(tasksByDate.keys()).sort();
    
    if (allDates.length === 0) {
      // If no tasks, show current week
      const timeline: TimelineDay[] = [];
      for (let i = -3; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        timeline.push({
          day: date.getDate(),
          month: date.toLocaleDateString('en-US', { month: 'long' }),
          isCurrent: dateStr === todayStr,
          tasks: [],
        });
      }
      return timeline;
    }

    // Create timeline with all dates from min to max (and include today)
    const minDate = new Date(Math.min(new Date(allDates[0]).getTime(), today.getTime()));
    const maxDate = new Date(Math.max(new Date(allDates[allDates.length - 1]).getTime(), today.getTime()));
    
    const timeline: TimelineDay[] = [];
    const currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      timeline.push({
        day: currentDate.getDate(),
        month: currentDate.toLocaleDateString('en-US', { month: 'long' }),
        isCurrent: dateStr === todayStr,
        tasks: tasksByDate.get(dateStr) || [],
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return timeline;
  },
}));
