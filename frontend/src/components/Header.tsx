import React, { useState, useEffect } from 'react';
import {
  FileText,
  Moon,
  Sun,
  Download,
  Settings,
  HelpCircle,
  Columns,
  Maximize2,
  BookOpen,
  Check,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { DocumentPreset } from '../types';

interface HeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  preset: DocumentPreset;
  onPresetChange: (preset: DocumentPreset) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  viewMode: 'split' | 'editor' | 'preview';
  onViewModeChange: (mode: 'split' | 'editor' | 'preview') => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onExportClick: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onGoHome: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onTitleChange,
  preset,
  onPresetChange,
  isDarkMode,
  onToggleTheme,
  viewMode,
  onViewModeChange,
  isSaving,
  hasUnsavedChanges,
  onExportClick,
  onOpenSettings,
  onOpenShortcuts,
  onGoHome,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleSubmit();
    if (e.key === 'Escape') {
      setTempTitle(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="flex-none h-14 border-b border-[#e5e3dd] dark:border-[#24292e] bg-[#faf9f6] dark:bg-[#111315] px-2 sm:px-4 flex items-center justify-between select-none z-20">
      {/* Left: Sidebar Toggle, Brand & Document Title */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0 flex-1 mr-2">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close document sidebar' : 'Open document sidebar'}
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="md:hidden p-2 -ml-1 rounded text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[38px] min-h-[38px]"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Brand Monogram */}
        <button
          onClick={onGoHome}
          title="Back to Landing Page"
          className="flex items-center space-x-1.5 sm:space-x-2 text-gray-900 dark:text-gray-100 hover:text-amber-700 dark:hover:text-amber-500 transition-colors group flex-none"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-700 dark:bg-amber-600 flex items-center justify-center text-white shadow-sm font-serif font-bold text-sm sm:text-base group-hover:scale-105 transition-transform">
            P
          </div>
          <span className="font-semibold text-xs sm:text-sm tracking-tight hidden lg:inline font-serif">
            Paperflow
          </span>
        </button>

        <span className="text-gray-300 dark:text-gray-700 hidden sm:inline flex-none">/</span>

        {/* Document Title (Click to edit) */}
        <div className="relative flex items-center min-w-0 max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-[360px]">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              className="text-xs sm:text-sm font-medium px-2 py-1 bg-white dark:bg-gray-800 border border-amber-500 rounded outline-none w-full"
            />
          ) : (
            <button
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              title="Click to rename document"
              className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-amber-700 dark:hover:text-amber-400 truncate max-w-full text-left py-1 px-1 sm:px-1.5 rounded hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {title || 'Untitled Document'}
            </button>
          )}
        </div>

        {/* Save Status Indicator */}
        <div className="flex items-center text-[11px] text-gray-400 dark:text-gray-500 flex-none">
          {isSaving ? (
            <span className="flex items-center text-amber-600 animate-pulse" title="Saving changes...">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 sm:mr-1" />
              <span className="hidden sm:inline">Saving...</span>
            </span>
          ) : hasUnsavedChanges ? (
            <span className="flex items-center text-amber-700 dark:text-amber-500" title="Unsaved changes">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 sm:mr-1" />
              <span className="hidden sm:inline">Unsaved</span>
            </span>
          ) : (
            <span className="hidden sm:flex items-center text-gray-400" title="All changes saved">
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-500 sm:mr-1" />
              <span className="hidden md:inline">Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Center Controls (Desktop Only): Preset Selector & Desktop View Switcher */}
      <div className="hidden md:flex items-center space-x-2 sm:space-x-3 mr-2 sm:mr-4 flex-none">
        {/* Preset Selector */}
        <div className="relative hidden lg:flex items-center">
          <select
            value={preset}
            onChange={(e) => onPresetChange(e.target.value as DocumentPreset)}
            className="text-xs font-medium bg-transparent border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded px-2.5 py-1 text-gray-700 dark:text-gray-300 outline-none cursor-pointer pr-6 appearance-none transition-colors"
          >
            <option value="academic">Academic Notes</option>
            <option value="technical">Technical Docs</option>
            <option value="minimal">Minimal</option>
            <option value="research">Research Paper</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Desktop View Mode Toggle */}
        <div className="flex items-center bg-gray-200/70 dark:bg-gray-800/60 p-0.5 rounded border border-gray-200/50 dark:border-gray-700/50 text-xs">
          <button
            onClick={() => onViewModeChange('editor')}
            title="Editor Only"
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'editor'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Editor</span>
            <Maximize2 className="w-3.5 h-3.5 sm:hidden" />
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            title="Split View"
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Split</span>
            <Columns className="w-3.5 h-3.5 sm:hidden" />
          </button>
          <button
            onClick={() => onViewModeChange('preview')}
            title="Preview Only"
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'preview'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Preview</span>
            <BookOpen className="w-3.5 h-3.5 sm:hidden" />
          </button>
        </div>
      </div>

      {/* Right Controls: Theme, Settings, Shortcuts & Export PDF */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 flex-none">
        <button
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 sm:p-2 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts"
          aria-label="Keyboard Shortcuts"
          className="p-1.5 sm:p-2 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors hidden sm:flex items-center justify-center min-w-[40px] min-h-[40px]"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Document Settings"
          aria-label="Document Settings"
          className="p-1.5 sm:p-2 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Primary Export PDF Button */}
        <button
          onClick={onExportClick}
          aria-label="Export PDF"
          className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 ml-0.5 sm:ml-1 min-h-[36px] sm:min-h-[38px]"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-none" />
          <span className="hidden xs:inline sm:inline">Export</span>
          <span className="hidden sm:inline">PDF</span>
        </button>
      </div>
    </header>
  );
};
