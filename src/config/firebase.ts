import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let dbInstance: any = null;

// In-memory fallback database for when Firebase service account env vars are not set
const memoryCollections: Record<string, Map<string, any>> = {
  campaign_configs: new Map(),
  public_interactions: new Map()
};

/**
 * Initializes and provides the Firestore database instance on the server.
 * Uses service account credentials when provided; gracefully falls back to memory store in local/demo mode.
 */
export function getFirestoreDb(): {
  collection: (name: string) => any;
  isRealFirebase: boolean;
} {
  if (dbInstance) {
    return dbInstance;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines from environment variable formatting
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      const firestore = getFirestore();
      dbInstance = {
        collection: (name: string) => firestore.collection(name),
        isRealFirebase: true
      };
      console.log(`[Firestore] Connected successfully to project: ${projectId}`);
      return dbInstance;
    } catch (err) {
      console.warn('[Firestore] Failed to initialize Firebase Admin with provided credentials:', err);
    }
  } else {
    console.log('[Firestore] FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not set.');
    console.log('[Firestore] Using high-performance resilient in-memory datastore for campaign_configs & public_interactions.');
  }

  // Resilient In-Memory Firestore-compatible adapter
  const fallbackAdapter = {
    isRealFirebase: false,
    collection: (collName: string) => {
      if (!memoryCollections[collName]) {
        memoryCollections[collName] = new Map();
      }
      const map = memoryCollections[collName];

      return {
        doc: (docId: string) => ({
          get: async () => {
            const data = map.get(docId);
            return {
              exists: !!data,
              id: docId,
              data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined)
            };
          },
          set: async (data: any, options?: { merge?: boolean }) => {
            if (options?.merge && map.has(docId)) {
              const prev = map.get(docId);
              map.set(docId, { ...prev, ...data });
            } else {
              map.set(docId, JSON.parse(JSON.stringify(data)));
            }
            return { writeTime: new Date() };
          },
          update: async (data: any) => {
            if (!map.has(docId)) throw new Error(`Document ${docId} does not exist`);
            const prev = map.get(docId);
            map.set(docId, { ...prev, ...data });
          }
        }),
        add: async (data: any) => {
          const autoId = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
          map.set(autoId, { id: autoId, ...JSON.parse(JSON.stringify(data)) });
          return { id: autoId };
        },
        where: function (field: string, op: string, value: any) {
          return {
            get: async () => {
              const results: any[] = [];
              for (const [id, val] of map.entries()) {
                if (op === '==' && val[field] === value) {
                  results.push({ id, data: () => val });
                }
              }
              return {
                empty: results.length === 0,
                docs: results,
                size: results.length
              };
            }
          };
        },
        get: async () => {
          const results: any[] = [];
          for (const [id, val] of map.entries()) {
            results.push({ id, data: () => val });
          }
          return {
            empty: results.length === 0,
            docs: results,
            size: results.length
          };
        }
      };
    }
  };

  dbInstance = fallbackAdapter;
  return dbInstance;
}
