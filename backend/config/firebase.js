const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let db = null;
let isFirebaseConnected = false;
let mode = "demo_inmemory";

// In-Memory Database Store for Instant Zero-Config Offline/Demo Mode
class InMemoryFirestore {
  constructor() {
    this.collections = {
      users: new Map(),
      tasks: new Map(),
      updates: new Map(),
    };
  }

  collection(collectionName) {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = new Map();
    }
    const store = this.collections[collectionName];

    return {
      doc: (id) => ({
        get: async () => {
          const data = store.get(id);
          return {
            exists: !!data,
            id,
            data: () => (data ? JSON.parse(JSON.stringify(data)) : null),
          };
        },
        set: async (data, options = {}) => {
          const existing = store.get(id) || {};
          const merged = options.merge ? { ...existing, ...data, id } : { ...data, id };
          store.set(id, merged);
          return merged;
        },
        update: async (data) => {
          const existing = store.get(id);
          if (!existing) throw new Error(`Document ${id} not found`);
          const updated = { ...existing, ...data };
          store.set(id, updated);
          return updated;
        },
        delete: async () => {
          store.delete(id);
          return true;
        },
      }),
      add: async (data) => {
        const id = data.id || "doc_" + Math.random().toString(36).substr(2, 9) + Date.now();
        const docData = { ...data, id };
        store.set(id, docData);
        return {
          id,
          get: async () => ({ exists: true, id, data: () => docData }),
        };
      },
      get: async () => {
        const docs = Array.from(store.values()).map((docData) => ({
          id: docData.id,
          data: () => JSON.parse(JSON.stringify(docData)),
        }));
        return {
          empty: docs.length === 0,
          size: docs.length,
          docs,
          forEach: (callback) => docs.forEach(callback),
        };
      },
      where: function (field, op, value) {
        return {
          get: async () => {
            let docs = Array.from(store.values());
            if (op === "==") {
              docs = docs.filter((item) => item[field] === value);
            } else if (op === ">=") {
              docs = docs.filter((item) => item[field] >= value);
            } else if (op === "<=") {
              docs = docs.filter((item) => item[field] <= value);
            } else if (op === "array-contains") {
              docs = docs.filter((item) => Array.isArray(item[field]) && item[field].includes(value));
            }
            const formattedDocs = docs.map((docData) => ({
              id: docData.id,
              data: () => JSON.parse(JSON.stringify(docData)),
            }));
            return {
              empty: formattedDocs.length === 0,
              size: formattedDocs.length,
              docs: formattedDocs,
              forEach: (callback) => formattedDocs.forEach(callback),
            };
          },
          orderBy: function (orderField, direction = "asc") {
            return {
              get: async () => {
                let docs = Array.from(store.values());
                if (op === "==") {
                  docs = docs.filter((item) => item[field] === value);
                }
                docs.sort((a, b) => {
                  if (a[orderField] < b[orderField]) return direction === "asc" ? -1 : 1;
                  if (a[orderField] > b[orderField]) return direction === "asc" ? 1 : -1;
                  return 0;
                });
                const formattedDocs = docs.map((docData) => ({
                  id: docData.id,
                  data: () => JSON.parse(JSON.stringify(docData)),
                }));
                return {
                  empty: formattedDocs.length === 0,
                  size: formattedDocs.length,
                  docs: formattedDocs,
                  forEach: (callback) => formattedDocs.forEach(callback),
                };
              },
            };
          },
        };
      },
      orderBy: function (orderField, direction = "asc") {
        return {
          get: async () => {
            let docs = Array.from(store.values());
            docs.sort((a, b) => {
              if (a[orderField] < b[orderField]) return direction === "asc" ? -1 : 1;
              if (a[orderField] > b[orderField]) return direction === "asc" ? 1 : -1;
              return 0;
            });
            const formattedDocs = docs.map((docData) => ({
              id: docData.id,
              data: () => JSON.parse(JSON.stringify(docData)),
            }));
            return {
              empty: formattedDocs.length === 0,
              size: formattedDocs.length,
              docs: formattedDocs,
              forEach: (callback) => formattedDocs.forEach(callback),
            };
          },
        };
      },
    };
  }
}

// Check for Service Account Key in backend directory or environment variables
const serviceAccountPath1 = path.join(__dirname, "..", "serviceAccountKey.json");
const serviceAccountPath2 = path.join(__dirname, "serviceAccountKey.json");

let serviceAccount = null;

if (fs.existsSync(serviceAccountPath1)) {
  serviceAccount = require(serviceAccountPath1);
} else if (fs.existsSync(serviceAccountPath2)) {
  serviceAccount = require(serviceAccountPath2);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (err) {
    console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT_JSON:", err.message);
  }
}

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    isFirebaseConnected = true;
    mode = "cloud_firestore";
    console.log("🔥 [Firebase] Connected successfully to Cloud Firestore:", serviceAccount.project_id);
  } catch (error) {
    console.warn("⚠️ [Firebase] Failed to initialize Firebase Admin SDK. Switching to Demo In-Memory mode:", error.message);
    db = new InMemoryFirestore();
  }
} else {
  console.log("ℹ️ [Firebase] No serviceAccountKey.json found. Operating in High-Fidelity Demo In-Memory Firestore Mode.");
  console.log("ℹ️ [Firebase] To connect real Cloud Firestore, refer to FIREBASE_SETUP_GUIDE.md.");
  db = new InMemoryFirestore();
}

module.exports = {
  admin,
  db,
  isFirebaseConnected,
  mode,
};
