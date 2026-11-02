import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { CodeEditor } from '../editor/CodeEditor';
import { LivePreview } from '../preview/LivePreview';
import { ExportModal } from '../components/ExportModal';
import { UploadModal } from '../components/UploadModal';
import { SettingsModal } from '../components/SettingsModal';
import { ShortcutsModal } from '../components/ShortcutsModal';
import { extractOutline } from '../preview/markdownRenderer';
import {
  PaperflowDocument,
  ExportSettings,
  DocumentMetadata,
  DocumentPreset,
} from '../types';
import {
  getAllDocuments,
  saveDocument,
  deleteDocument,
  createNewDocument,
  initializeDefaultDocuments,
  getActiveDocId,
  setActiveDocId,
  generateDocumentId,
  DEFAULT_DOCUMENT_SETTINGS,
} from '../services/db';
import { SAMPLE_DOCUMENTS } from '../samples';

interface EditorPageProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onGoHome: () => void;
  initialSampleId?: string | null;
}

export const EditorPage: React.FC<EditorPageProps> = ({
  isDarkMode,
  onToggleTheme,
  onGoHome,
  initialSampleId,
}) => {
  // Authoritative Document State: single source of truth
  const [documents, setDocuments] = useState<PaperflowDocument[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  // Persistence / Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Ref to always access the latest documents array in async operations
  const documentsRef = useRef<PaperflowDocument[]>(documents);
  documentsRef.current = documents;

  // Ref to track activeDocumentId for closures
  const activeDocIdRef = useRef<string | null>(activeDocumentId);
  activeDocIdRef.current = activeDocumentId;

  // Map of documentId -> debounce timeout to isolate autosave per document
  const pendingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage for left panel
  const isDraggingSplitterRef = useRef(false);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Derive the currently active document from the authoritative documents collection
  const activeDocument = useMemo(() => {
    if (!documents.length) return null;
    if (activeDocumentId) {
      const found = documents.find((doc) => doc.id === activeDocumentId);
      if (found) return found;
    }
    return documents[0];
  }, [documents, activeDocumentId]);

  // Flush pending save for a specific document, or all pending documents
  const flushPendingSave = useCallback(async (docId?: string | null) => {
    if (docId) {
      const timer = pendingTimeoutsRef.current.get(docId);
      if (timer) {
        clearTimeout(timer);
        pendingTimeoutsRef.current.delete(docId);
      }
      const docToSave = documentsRef.current.find((d) => d.id === docId);
      if (docToSave) {
        setIsSaving(true);
        await saveDocument(docToSave);
        setIsSaving(false);
      }
    } else {
      for (const [id, timer] of pendingTimeoutsRef.current.entries()) {
        clearTimeout(timer);
        const docToSave = documentsRef.current.find((d) => d.id === id);
        if (docToSave) {
          await saveDocument(docToSave);
        }
      }
      pendingTimeoutsRef.current.clear();
      setIsSaving(false);
    }
    setHasUnsavedChanges(pendingTimeoutsRef.current.size > 0);
  }, []);

  // Update a specific document by its ID
  const updateDocument = useCallback(
    (docId: string, updates: Partial<PaperflowDocument>) => {
      setDocuments((prevDocs) => {
        const targetDoc = prevDocs.find((d) => d.id === docId);
        if (!targetDoc) return prevDocs;

        const updatedDoc: PaperflowDocument = {
          ...targetDoc,
          ...updates,
          updatedAt: Date.now(),
        };

        // Synchronize title across root and metadata if either was explicitly modified
        if (updates.title !== undefined && (!updates.metadata || updates.metadata.title === undefined)) {
          updatedDoc.metadata = { ...updatedDoc.metadata, title: updates.title };
        } else if (updates.metadata?.title !== undefined && updates.title === undefined) {
          updatedDoc.title = updates.metadata.title;
        }

        return prevDocs.map((d) => (d.id === docId ? updatedDoc : d));
      });

      setHasUnsavedChanges(true);

      // Debounced autosave targeting this specific document ID
      const existingTimer = pendingTimeoutsRef.current.get(docId);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(async () => {
        pendingTimeoutsRef.current.delete(docId);
        const docToSave = documentsRef.current.find((d) => d.id === docId);
        if (docToSave) {
          setIsSaving(true);
          await saveDocument(docToSave);
          setIsSaving(false);
        }
        setHasUnsavedChanges(pendingTimeoutsRef.current.size > 0);
      }, 500);

      pendingTimeoutsRef.current.set(docId, timer);
    },
    []
  );

  // 1. Initial Load from IndexedDB
  useEffect(() => {
    async function loadData() {
      const allDocs = await getAllDocuments();

      if (initialSampleId) {
        const foundSample = SAMPLE_DOCUMENTS.find((s) => s.id === initialSampleId);
        if (foundSample) {
          const sampleDoc: PaperflowDocument = {
            id: generateDocumentId(),
            title: foundSample.title,
            markdown: foundSample.markdown,
            metadata: { ...foundSample.metadata },
            settings: {
              ...DEFAULT_DOCUMENT_SETTINGS,
              preset: foundSample.preset,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await saveDocument(sampleDoc);
          const updatedDocs = [sampleDoc, ...allDocs.filter((d) => d.id !== sampleDoc.id)];
          setDocuments(updatedDocs);
          setActiveDocumentId(sampleDoc.id);
          setActiveDocId(sampleDoc.id);
          return;
        }
      }

      if (allDocs.length === 0) {
        const initial = await initializeDefaultDocuments();
        setDocuments([initial]);
        setActiveDocumentId(initial.id);
        setActiveDocId(initial.id);
      } else {
        setDocuments(allDocs);
        const savedActiveId = getActiveDocId();
        const activeExists = savedActiveId ? allDocs.some((d) => d.id === savedActiveId) : false;
        const targetId = activeExists ? savedActiveId! : allDocs[0].id;
        setActiveDocumentId(targetId);
        setActiveDocId(targetId);
      }
    }

    loadData();
  }, [initialSampleId]);

  // Flush saves on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPendingSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushPendingSave();
    };
  }, [flushPendingSave]);

  // Document selection handler
  const handleSelectDoc = useCallback(
    async (id: string) => {
      if (id === activeDocumentId) return;

      const exists = documentsRef.current.some((d) => d.id === id);
      if (!exists) return;

      // Flush any pending save on current document before switching
      if (activeDocIdRef.current) {
        await flushPendingSave(activeDocIdRef.current);
      }

      setActiveDocumentId(id);
      setActiveDocId(id);
    },
    [activeDocumentId, flushPendingSave]
  );

  // Create brand new document
  const handleNewDoc = useCallback(async () => {
    // Flush current document edits first
    if (activeDocIdRef.current) {
      await flushPendingSave(activeDocIdRef.current);
    }

    const newDoc = createNewDocument();
    await saveDocument(newDoc);

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocumentId(newDoc.id);
    setActiveDocId(newDoc.id);
  }, [flushPendingSave]);

  // Load a sample document as a fresh independent document
  const handleLoadSample = useCallback(
    async (sampleId: string) => {
      const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
      if (!sample) return;

      if (activeDocIdRef.current) {
        await flushPendingSave(activeDocIdRef.current);
      }

      const newDoc: PaperflowDocument = {
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

      await saveDocument(newDoc);
      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocumentId(newDoc.id);
      setActiveDocId(newDoc.id);
    },
    [flushPendingSave]
  );

  // Handle uploaded Markdown file
  const handleUploadSuccess = useCallback(
    async (filename: string, content: string) => {
      if (activeDocIdRef.current) {
        await flushPendingSave(activeDocIdRef.current);
      }

      const cleanTitle = filename.replace(/\.(md|markdown|txt)$/i, '') || 'Uploaded Document';
      const newDoc = createNewDocument(cleanTitle, content);
      newDoc.metadata.title = cleanTitle;

      await saveDocument(newDoc);
      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocumentId(newDoc.id);
      setActiveDocId(newDoc.id);
    },
    [flushPendingSave]
  );

  // Delete document
  const handleDeleteDoc = useCallback(
    async (id: string) => {
      // Clear pending timer for this document
      const timer = pendingTimeoutsRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        pendingTimeoutsRef.current.delete(id);
      }

      await deleteDocument(id);
      const remaining = documentsRef.current.filter((d) => d.id !== id);

      if (remaining.length === 0) {
        const newDoc = createNewDocument();
        await saveDocument(newDoc);
        setDocuments([newDoc]);
        setActiveDocumentId(newDoc.id);
        setActiveDocId(newDoc.id);
      } else {
        setDocuments(remaining);
        if (activeDocIdRef.current === id) {
          const nextId = remaining[0].id;
          setActiveDocumentId(nextId);
          setActiveDocId(nextId);
        }
      }
    },
    []
  );

  // Document stats & outline derived from authoritative active document
  const { wordCount, charCount, outline } = useMemo(() => {
    const md = activeDocument?.markdown || '';
    const words = md.trim() ? md.trim().split(/\s+/).length : 0;
    const chars = md.length;
    const out = extractOutline(md);
    return { wordCount: words, charCount: chars, outline: out };
  }, [activeDocument?.markdown]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if (isMod && e.key === 'o') {
        e.preventDefault();
        setIsUploadOpen(true);
      } else if (isMod && e.key === 's') {
        e.preventDefault();
        if (activeDocIdRef.current) {
          flushPendingSave(activeDocIdRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flushPendingSave]);

  // Resizable split-pane handlers
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSplitterRef.current = true;
    document.addEventListener('mousemove', handleSplitterMouseMove);
    document.addEventListener('mouseup', handleSplitterMouseUp);
  };

  const handleSplitterMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingSplitterRef.current) return;
    const container = document.getElementById('workspace-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
    if (newRatio > 20 && newRatio < 80) {
      setSplitRatio(newRatio);
    }
  }, []);

  const handleSplitterMouseUp = useCallback(() => {
    isDraggingSplitterRef.current = false;
    document.removeEventListener('mousemove', handleSplitterMouseMove);
    document.removeEventListener('mouseup', handleSplitterMouseUp);
  }, [handleSplitterMouseMove]);

  if (!activeDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#0c0e0f] text-gray-500 font-sans text-xs">
        Loading document...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#faf9f6] text-[#141716] dark:bg-[#0c0e0f] dark:text-[#ededed] font-sans">
      {/* Header Bar */}
      <Header
        title={activeDocument.title}
        onTitleChange={(title) => updateDocument(activeDocument.id, { title })}
        preset={activeDocument.settings.preset}
        onPresetChange={(preset) =>
          updateDocument(activeDocument.id, {
            settings: { ...activeDocument.settings, preset },
          })
        }
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onExportClick={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onGoHome={onGoHome}
      />

      {/* Main Workspace (Sidebar + Resizable Editor & Preview) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          documents={documents}
          activeDocId={activeDocument.id}
          onSelectDoc={handleSelectDoc}
          onNewDoc={handleNewDoc}
          onLoadSample={handleLoadSample}
          onUploadClick={() => setIsUploadOpen(true)}
          onDeleteDoc={handleDeleteDoc}
          outline={outline}
          wordCount={wordCount}
          charCount={charCount}
        />

        {/* Resizable Editor & Preview Container */}
        <div id="workspace-container" className="flex-1 flex overflow-hidden relative">
          {/* Left Panel: Markdown Editor */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <div
              style={{
                width: viewMode === 'split' ? `${splitRatio}%` : '100%',
              }}
              className="h-full flex flex-col bg-[#faf9f6] dark:bg-[#0e1012] overflow-hidden"
            >
              <CodeEditor
                key={activeDocument.id}
                documentId={activeDocument.id}
                value={activeDocument.markdown}
                onChange={(markdown) => updateDocument(activeDocument.id, { markdown })}
                isDarkMode={isDarkMode}
                onDropFile={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    handleUploadSuccess(file.name, e.target?.result as string);
                  };
                  reader.readAsText(file);
                }}
                onExportPdf={() => setIsExportOpen(true)}
              />
            </div>
          )}

          {/* Splitter Handle */}
          {viewMode === 'split' && (
            <div
              onMouseDown={handleSplitterMouseDown}
              className="w-1.5 hover:w-2 bg-[#e5e3dd] dark:bg-[#22262b] hover:bg-amber-600 dark:hover:bg-amber-500 cursor-col-resize transition-colors z-10 flex items-center justify-center select-none"
            >
              <div className="w-0.5 h-6 bg-gray-400 dark:bg-gray-600 rounded" />
            </div>
          )}

          {/* Right Panel: Live Document Preview */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div
              style={{
                width: viewMode === 'split' ? `${100 - splitRatio}%` : '100%',
              }}
              className="h-full flex flex-col overflow-hidden"
            >
              <LivePreview
                markdown={activeDocument.markdown}
                metadata={activeDocument.metadata}
                settings={activeDocument.settings}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        markdown={activeDocument.markdown}
        metadata={activeDocument.metadata}
        settings={activeDocument.settings}
        onUpdateSettings={(newSettings) =>
          updateDocument(activeDocument.id, { settings: newSettings })
        }
        wordCount={wordCount}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        metadata={activeDocument.metadata}
        onUpdateMetadata={(newMetadata) =>
          updateDocument(activeDocument.id, {
            metadata: newMetadata,
            title: newMetadata.title || activeDocument.title,
          })
        }
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
