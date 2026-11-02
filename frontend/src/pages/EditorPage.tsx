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
  setActiveDocId,
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
  // Document state
  const [documents, setDocuments] = useState<PaperflowDocument[]>([]);
  const [currentDoc, setCurrentDoc] = useState<PaperflowDocument | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  // Debounced save timer ref
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial Load from IndexedDB
  useEffect(() => {
    async function loadData() {
      const allDocs = await getAllDocuments();
      let active: PaperflowDocument;

      if (initialSampleId) {
        const foundSample = SAMPLE_DOCUMENTS.find((s) => s.id === initialSampleId);
        if (foundSample) {
          active = {
            id: 'doc_' + Math.random().toString(36).substring(2, 11),
            title: foundSample.title,
            markdown: foundSample.markdown,
            metadata: { ...foundSample.metadata },
            settings: {
              preset: foundSample.preset,
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
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await saveDocument(active);
          const updatedDocs = await getAllDocuments();
          setDocuments(updatedDocs);
          setCurrentDoc(active);
          setActiveDocId(active.id);
          return;
        }
      }

      if (allDocs.length === 0) {
        active = await initializeDefaultDocuments();
        setDocuments([active]);
      } else {
        setDocuments(allDocs);
        active = allDocs[0];
      }
      setCurrentDoc(active);
      setActiveDocId(active.id);
    }

    loadData();
  }, [initialSampleId]);

  // 2. Debounced auto-save when doc content changes
  const queueSave = useCallback((docToSave: PaperflowDocument) => {
    setHasUnsavedChanges(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      await saveDocument(docToSave);
      setIsSaving(false);
      setHasUnsavedChanges(false);

      // Update in documents list
      setDocuments((prev) =>
        prev.map((d) => (d.id === docToSave.id ? { ...docToSave, updatedAt: Date.now() } : d))
      );
    }, 600);
  }, []);

  // Update Markdown text
  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      if (!currentDoc) return;
      const updated: PaperflowDocument = {
        ...currentDoc,
        markdown: newMarkdown,
      };
      setCurrentDoc(updated);
      queueSave(updated);
    },
    [currentDoc, queueSave]
  );

  // Update Title
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      if (!currentDoc) return;
      const updated: PaperflowDocument = {
        ...currentDoc,
        title: newTitle,
        metadata: {
          ...currentDoc.metadata,
          title: newTitle,
        },
      };
      setCurrentDoc(updated);
      queueSave(updated);
    },
    [currentDoc, queueSave]
  );

  // Update Preset
  const handlePresetChange = useCallback(
    (newPreset: DocumentPreset) => {
      if (!currentDoc) return;
      const updated: PaperflowDocument = {
        ...currentDoc,
        settings: {
          ...currentDoc.settings,
          preset: newPreset,
        },
      };
      setCurrentDoc(updated);
      queueSave(updated);
    },
    [currentDoc, queueSave]
  );

  // Update Settings
  const handleUpdateSettings = useCallback(
    (newSettings: ExportSettings) => {
      if (!currentDoc) return;
      const updated: PaperflowDocument = {
        ...currentDoc,
        settings: newSettings,
      };
      setCurrentDoc(updated);
      queueSave(updated);
    },
    [currentDoc, queueSave]
  );

  // Update Metadata
  const handleUpdateMetadata = useCallback(
    (newMetadata: DocumentMetadata) => {
      if (!currentDoc) return;
      const updated: PaperflowDocument = {
        ...currentDoc,
        title: newMetadata.title || currentDoc.title,
        metadata: newMetadata,
      };
      setCurrentDoc(updated);
      queueSave(updated);
    },
    [currentDoc, queueSave]
  );

  // Select document
  const handleSelectDoc = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setCurrentDoc(doc);
      setActiveDocId(doc.id);
    }
  };

  // Create new document
  const handleNewDoc = async () => {
    const newDoc = createNewDocument('Untitled Document', '# Untitled Document\n\nWrite your thoughts or equations here...\n');
    await saveDocument(newDoc);
    const updated = await getAllDocuments();
    setDocuments(updated);
    setCurrentDoc(newDoc);
    setActiveDocId(newDoc.id);
  };

  // Load a sample document
  const handleLoadSample = async (sampleId: string) => {
    const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (!sample) return;

    const newDoc: PaperflowDocument = {
      id: 'doc_' + Math.random().toString(36).substring(2, 11),
      title: sample.title,
      markdown: sample.markdown,
      metadata: { ...sample.metadata },
      settings: {
        preset: sample.preset,
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
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveDocument(newDoc);
    const updated = await getAllDocuments();
    setDocuments(updated);
    setCurrentDoc(newDoc);
    setActiveDocId(newDoc.id);
  };

  // Handle uploaded Markdown file
  const handleUploadSuccess = async (filename: string, content: string) => {
    const cleanTitle = filename.replace(/\.(md|markdown|txt)$/i, '');
    const newDoc = createNewDocument(cleanTitle, content);
    newDoc.metadata.title = cleanTitle;
    await saveDocument(newDoc);
    const updated = await getAllDocuments();
    setDocuments(updated);
    setCurrentDoc(newDoc);
    setActiveDocId(newDoc.id);
  };

  // Delete document
  const handleDeleteDoc = async (id: string) => {
    await deleteDocument(id);
    const updated = await getAllDocuments();
    setDocuments(updated);
    if (currentDoc?.id === id && updated.length > 0) {
      setCurrentDoc(updated[0]);
      setActiveDocId(updated[0].id);
    }
  };

  // Document stats & outline
  const { wordCount, charCount, outline } = useMemo(() => {
    const md = currentDoc?.markdown || '';
    const words = md.trim() ? md.trim().split(/\s+/).length : 0;
    const chars = md.length;
    const out = extractOutline(md);
    return { wordCount: words, charCount: chars, outline: out };
  }, [currentDoc?.markdown]);

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
        if (currentDoc) {
          saveDocument(currentDoc).then(() => {
            setHasUnsavedChanges(false);
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDoc]);

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

  if (!currentDoc) {
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
        title={currentDoc.title}
        onTitleChange={handleTitleChange}
        preset={currentDoc.settings.preset}
        onPresetChange={handlePresetChange}
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
          activeDocId={currentDoc.id}
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
                value={currentDoc.markdown}
                onChange={handleMarkdownChange}
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
                markdown={currentDoc.markdown}
                metadata={currentDoc.metadata}
                settings={currentDoc.settings}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        markdown={currentDoc.markdown}
        metadata={currentDoc.metadata}
        settings={currentDoc.settings}
        onUpdateSettings={handleUpdateSettings}
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
        metadata={currentDoc.metadata}
        onUpdateMetadata={handleUpdateMetadata}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
