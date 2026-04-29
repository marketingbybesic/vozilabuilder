import Dexie, { type Table } from 'dexie';
import type { Task, Project, JournalEntry, UserPreferences } from '../types/index';

export class NeuroflowDB extends Dexie {
  tasks!: Table<Task, string>;
  projects!: Table<Project, string>;
  journalEntries!: Table<JournalEntry, string>;
  userPreferences!: Table<UserPreferences, string>;

  constructor() {
    super('NeuroflowDB');

    this.version(1).stores({
      tasks: 'id, projectId, status, priority, dueDate, isMIT',
      projects: 'id, name, archived',
      journalEntries: 'id, date',
      userPreferences: 'id',
    });
  }
}

export const db = new NeuroflowDB();
