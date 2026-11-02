import { PaperflowDocument, ExportSettings, DocumentMetadata } from '../types';
import { SAMPLE_DOCUMENTS } from '../samples';

const DB_NAME = 'paperflow_db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';
const ACTIVE_DOC_KEY = 'paperflow_active_doc_id';

export const DEFAULT_DOCUMENT_SETTINGS: ExportSettings = {
  preset: 'academic',
  pageSize: 'a4',
  orientation: 'portrait',
  margins: 'normal',
  fontSize: '11pt',
  lineSpacing: 1.4,
  includeToc: false,
  tocDepth: 3,
  numberedHeadings: true,
  pageNumbering: '1',
  headerText: '',
  footerText: '',
  fontFamily: '',
  twoColumn: false,
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllDocuments(): Promise<PaperflowDocument[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const docs = (request.result as PaperflowDocument[]) || [];
        docs.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(docs);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get documents from IndexedDB:', err);
    return [];
  }
}

export async function getDocumentById(id: string): Promise<PaperflowDocument | null> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get document:', err);
    return null;
  }
}

export async function saveDocument(doc: PaperflowDocument): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        ...doc,
        updatedAt: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save document:', err);
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete document:', err);
  }
}

export function getActiveDocId(): string | null {
  return localStorage.getItem(ACTIVE_DOC_KEY);
}

export function setActiveDocId(id: string): void {
  localStorage.setItem(ACTIVE_DOC_KEY, id);
}

export function generateDocumentId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'doc_' + crypto.randomUUID();
  }
  return 'doc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

export const DEFAULT_MARKDOWN_TEMPLATE = `# Untitled Document\n\nStart writing your document here...\n`;

export function createNewDocument(
  title = 'Untitled Document',
  initialMarkdown = DEFAULT_MARKDOWN_TEMPLATE,
  preset: ExportSettings['preset'] = 'academic'
): PaperflowDocument {
  const now = Date.now();
  return {
    id: generateDocumentId(),
    title,
    markdown: initialMarkdown,
    metadata: {
      title,
      author: '',
      subtitle: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      abstract: '',
    },
    settings: {
      ...DEFAULT_DOCUMENT_SETTINGS,
      preset,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export async function initializeDefaultDocuments(): Promise<PaperflowDocument> {
  const existing = await getAllDocuments();
  if (existing.length > 0) {
    const activeId = getActiveDocId();
    const found = existing.find(d => d.id === activeId);
    return found || existing[0];
  }

  // First time launch: populate with rich Physics sample document
  const sample = SAMPLE_DOCUMENTS[0];
  const initialDoc: PaperflowDocument = {
    id: generateDocumentId(),
    title: sample.title,
    markdown: sample.markdown,
    metadata: { ...sample.metadata },
    settings: {
      ...DEFAULT_DOCUMENT_SETTINGS,
      preset: sample.preset,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveDocument(initialDoc);
  setActiveDocId(initialDoc.id);
  return initialDoc;
}
