import { getDB, EventEntity, HelpDeskReportEntity, UserEntity, StoryEntity, ChatMessageEntity } from '../AppDatabase';
import { db as firestore, auth } from '../firebaseSetup';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, limit, orderBy } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Not throwing to avoid crashing the app if just offline or permission denied
}

// --- Event Repository ---
export const EventRepository = {
  async getAll(): Promise<EventEntity[]> {
    const db = await getDB();
    return db.getAll('events');
  },
  async insert(event: EventEntity): Promise<void> {
    const db = await getDB();
    await db.put('events', event);
    try {
      await setDoc(doc(firestore, 'events', event.id.toString()), event);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'events');
    }
  },
  async insertAll(events: EventEntity[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('events', 'readwrite');
    for (const event of events) {
      tx.store.put(event);
      try {
        await setDoc(doc(firestore, 'events', event.id.toString()), event);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'events');
      }
    }
    await tx.done;
  },
  async toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
    const db = await getDB();
    const event = await db.get('events', id);
    if (event) {
      event.isFavorite = isFavorite;
      await db.put('events', event);
      // isFavorite local only or synced? Usually local, but if synced:
    }
  },
  startSync(onUpdate: (events: EventEntity[]) => void): () => void {
    const q = query(collection(firestore, 'events'));
    return onSnapshot(q, async (snapshot) => {
      const db = await getDB();
      const tx = db.transaction('events', 'readwrite');
      const events: EventEntity[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as EventEntity;
        tx.store.put(data);
        events.push(data);
      });
      await tx.done;
      const allEvents = await db.getAll('events');
      onUpdate(allEvents);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });
  }
};

// --- Help Desk Repository ---
export const HelpDeskRepository = {
  async getAll(): Promise<HelpDeskReportEntity[]> {
    const db = await getDB();
    return db.getAll('reports');
  },
  async insert(report: HelpDeskReportEntity): Promise<void> {
    const db = await getDB();
    await db.put('reports', report);
    try {
      const payload = { ...report, ownerId: auth.currentUser?.uid || 'anonymous' };
      await setDoc(doc(firestore, 'reports', report.id.toString()), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reports');
    }
  },
  async insertAll(reports: HelpDeskReportEntity[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('reports', 'readwrite');
    for (const report of reports) {
      tx.store.put(report);
      try {
        const payload = { ...report, ownerId: auth.currentUser?.uid || 'anonymous' };
        await setDoc(doc(firestore, 'reports', report.id.toString()), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'reports');
      }
    }
    await tx.done;
  },
  async updateStatus(id: number, status: string): Promise<void> {
    const db = await getDB();
    const report = await db.get('reports', id);
    if (report) {
      report.status = status;
      await db.put('reports', report);
      try {
        await updateDoc(doc(firestore, 'reports', id.toString()), { status });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'reports');
      }
    }
  },
  async delete(id: number): Promise<void> {
    const db = await getDB();
    await db.delete('reports', id);
    try {
      await deleteDoc(doc(firestore, 'reports', id.toString()));
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, 'reports');
    }
  },
  startSync(onUpdate: (reports: HelpDeskReportEntity[]) => void): () => void {
    const q = query(collection(firestore, 'reports'), limit(100));
    return onSnapshot(q, async (snapshot) => {
      const db = await getDB();
      const tx = db.transaction('reports', 'readwrite');
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as HelpDeskReportEntity;
        tx.store.put(data);
      });
      await tx.done;
      const allReports = await db.getAll('reports');
      onUpdate(allReports);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });
  }
};

// --- User Repository ---
export const UserRepository = {
  async getSession(): Promise<UserEntity | undefined> {
    const db = await getDB();
    const allUsers = await db.getAll('users');
    return allUsers.length > 0 ? allUsers[0] : undefined;
  },
  async insert(user: UserEntity): Promise<void> {
    const db = await getDB();
    await db.clear('users'); // keep only one active session
    await db.put('users', user);
  },
  async logout(): Promise<void> {
    const db = await getDB();
    await db.clear('users');
  }
};

// --- Story Repository ---
export const StoryRepository = {
  async getAll(): Promise<StoryEntity[]> {
    const db = await getDB();
    return db.getAll('stories');
  },
  async insert(story: StoryEntity): Promise<void> {
    const db = await getDB();
    await db.put('stories', story);
  },
  async markAsRead(id: number): Promise<void> {
    const db = await getDB();
    const story = await db.get('stories', id);
    if (story) {
      story.isRead = true;
      await db.put('stories', story);
    }
  }
};

// --- Chat Repository ---
export const ChatRepository = {
  async getAll(): Promise<ChatMessageEntity[]> {
    const db = await getDB();
    return db.getAll('chats');
  },
  async insert(message: ChatMessageEntity): Promise<void> {
    const db = await getDB();
    await db.put('chats', message);
  }
};
