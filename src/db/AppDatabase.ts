import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface EventEntity {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  startTime: string;
  endTime: string;
  isFavorite: boolean;
  isLive: boolean;
}

export interface HelpDeskReportEntity {
  id: number;
  reportType: 'item' | 'person' | 'emergency';
  name: string;
  description: string;
  location: string;
  dateTime: string;
  contactNumber: string;
  status: string;
  imageUri?: string;
  age?: number; // for missing person
}

export interface UserEntity {
  id: string;
  name: string;
  emailOrPhone: string;
  guestMode: boolean;
  profileImageUri?: string;
  village?: string;
  preferredLanguage?: string;
}

export interface StoryEntity {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  category: string;
}

export interface ChatMessageEntity {
  id: number;
  message: string;
  senderType: 'user' | 'bot';
  timestamp: string;
}

interface JatreDB extends DBSchema {
  events: {
    key: number;
    value: EventEntity;
  };
  reports: {
    key: number;
    value: HelpDeskReportEntity;
  };
  users: {
    key: string;
    value: UserEntity;
  };
  stories: {
    key: number;
    value: StoryEntity;
  };
  chats: {
    key: number;
    value: ChatMessageEntity;
  };
}

let dbPromise: Promise<IDBPDatabase<JatreDB>>;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<JatreDB>('jatre-database', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stories')) {
          db.createObjectStore('stories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};
