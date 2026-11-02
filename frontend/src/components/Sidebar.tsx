import React, { useState } from 'react';
import {
  Plus,
  Upload,
  FolderOpen,
  ListTree,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';
import { PaperflowDocument, OutlineItem } from '../types';
import { SAMPLE_DOCUMENTS } from '../samples';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  documents: PaperflowDocument[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onNewDoc: () => void;
  onLoadSample: (sampleId: string) => void;
  onUploadClick: () => void;
  onDeleteDoc: (id: string) => void;
  outline: OutlineItem[];
  wordCount: number;
  charCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  documents,
  activeDocId,
  onSelectDoc,
  onNewDoc,
  onLoadSample,
  onUploadClick,
  onDeleteDoc,
  outline,
  wordCount,
  charCount,
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'outline'>('docs');
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);

  const readingTime = Math.ceil(wordCount / 200);

  if (!isOpen) {
    return (
      <div className="flex-none w-10 border-r border-[#e5e3dd] dark:border-[#24292e] bg-[#faf9f6] dark:bg-[#111315] flex flex-col items-center py-3 select-none">
        <button
          onClick={onToggle}
          title="Open Sidebar"
          className="p-1.5 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="flex-none w-64 sm:w-72 border-r border-[#e5e3dd] dark:border-[#24292e] bg-[#faf9f6] dark:bg-[#111315] flex flex-col h-full select-none text-xs">
      {/* Sidebar Header & Toggle */}
      <div className="flex-none p-3 border-b border-[#e5e3dd] dark:border-[#24292e] flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-gray-200/60 dark:bg-gray-800/60 p-0.5 rounded">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'docs'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('outline')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'outline'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Outline ({outline.length})
          </button>
        </div>

        <button
          onClick={onToggle}
          title="Collapse Sidebar"
          className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'docs' ? (
          <div className="space-y-4">
            {/* Action Buttons: New & Upload */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onNewDoc}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 rounded bg-white dark:bg-gray-900/60 font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>New Doc</span>
              </button>

              <button
                onClick={onUploadClick}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 rounded bg-white dark:bg-gray-900/60 font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload</span>
              </button>
            </div>

            {/* Load Sample Documents Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSamplesMenu(!showSamplesMenu)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 font-medium text-[11px]"
              >
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Load Sample Document</span>
                </span>
                <span>{showSamplesMenu ? '▲' : '▼'}</span>
              </button>

              {showSamplesMenu && (
                <div className="mt-1 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded shadow-md space-y-0.5">
                  {SAMPLE_DOCUMENTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onLoadSample(sample.id);
                        setShowSamplesMenu(false);
                      }}
                      className="w-full text-left p-2 rounded hover:bg-amber-50/70 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {sample.title}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {sample.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Documents List */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
                <span>Recent Documents ({documents.length})</span>
              </div>

              <div className="space-y-1">
                {documents.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => onSelectDoc(doc.id)}
                      className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-medium border border-amber-300/50 dark:border-amber-800/40'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <FileText className={`w-3.5 h-3.5 flex-none ${isActive ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400'}`} />
                        <span className="truncate">{doc.title || 'Untitled Document'}</span>
                      </div>

                      {documents.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${doc.title}"?`)) {
                              onDeleteDoc(doc.id);
                            }
                          }}
                          title="Delete document"
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Document Outline */
          <div className="space-y-1">
            {outline.length === 0 ? (
              <div className="py-8 text-center text-gray-400 italic">
                No headings found in document. Use # Heading to structure your document.
              </div>
            ) : (
              outline.map((item) => (
                <a
                  key={item.id + item.line}
                  href={`#${item.id}`}
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                  className="block py-1.5 pr-2 rounded text-gray-600 dark:text-gray-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors truncate"
                >
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mr-1">
                    {'#'.repeat(item.level)}
                  </span>
                  <span>{item.text}</span>
                </a>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sidebar Footer Stats */}
      <div className="flex-none p-3 border-t border-[#e5e3dd] dark:border-[#24292e] bg-[#f5f3ef]/60 dark:bg-[#141719]/60 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">{wordCount}</span> words
          <span className="mx-1.5">•</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{charCount}</span> chars
        </div>
        <div>
          <span>~{readingTime} min read</span>
        </div>
      </div>
    </aside>
  );
};
