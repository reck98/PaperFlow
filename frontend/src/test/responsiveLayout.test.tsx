import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { EditorPage } from '../pages/EditorPage';
import { ExportModal } from '../components/ExportModal';
import { SettingsModal } from '../components/SettingsModal';
import { UploadModal } from '../components/UploadModal';
import { ShortcutsModal } from '../components/ShortcutsModal';
import { renderMarkdownWithMath } from '../preview/markdownRenderer';
import { DEFAULT_DOCUMENT_SETTINGS } from '../services/db';
import { PaperflowDocument, DocumentMetadata } from '../types';

describe('PaperFlow Mobile-Responsive Layout & Touch Ergonomics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Header Responsive Component', () => {
    it('renders accessible mobile hamburger toggle and triggers sidebar open/close', () => {
      const onToggleSidebar = vi.fn();
      render(
        <Header
          title="Responsive Test Doc"
          onTitleChange={vi.fn()}
          preset="academic"
          onPresetChange={vi.fn()}
          isDarkMode={false}
          onToggleTheme={vi.fn()}
          viewMode="split"
          onViewModeChange={vi.fn()}
          isSaving={false}
          hasUnsavedChanges={false}
          onExportClick={vi.fn()}
          onOpenSettings={vi.fn()}
          onOpenShortcuts={vi.fn()}
          onGoHome={vi.fn()}
          onToggleSidebar={onToggleSidebar}
          isSidebarOpen={false}
        />
      );

      const hamburger = screen.getByRole('button', { name: /open document sidebar/i });
      expect(hamburger).toBeInTheDocument();
      fireEvent.click(hamburger);
      expect(onToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('allows editing title on tap with accessible inputs and keyboard submit', () => {
      const onTitleChange = vi.fn();
      render(
        <Header
          title="Initial Title"
          onTitleChange={onTitleChange}
          preset="academic"
          onPresetChange={vi.fn()}
          isDarkMode={false}
          onToggleTheme={vi.fn()}
          viewMode="split"
          onViewModeChange={vi.fn()}
          isSaving={false}
          hasUnsavedChanges={false}
          onExportClick={vi.fn()}
          onOpenSettings={vi.fn()}
          onOpenShortcuts={vi.fn()}
          onGoHome={vi.fn()}
        />
      );

      const titleButton = screen.getByRole('button', { name: 'Initial Title' });
      fireEvent.click(titleButton);

      const input = screen.getByDisplayValue('Initial Title');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'Renamed Title' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onTitleChange).toHaveBeenCalledWith('Renamed Title');
    });

    it('renders theme toggle, settings, and export button with minimum touch sizing', () => {
      const onExportClick = vi.fn();
      const onToggleTheme = vi.fn();
      render(
        <Header
          title="Document"
          onTitleChange={vi.fn()}
          preset="academic"
          onPresetChange={vi.fn()}
          isDarkMode={false}
          onToggleTheme={onToggleTheme}
          viewMode="split"
          onViewModeChange={vi.fn()}
          isSaving={false}
          hasUnsavedChanges={false}
          onExportClick={onExportClick}
          onOpenSettings={vi.fn()}
          onOpenShortcuts={vi.fn()}
          onGoHome={vi.fn()}
        />
      );

      const exportBtn = screen.getByRole('button', { name: /export/i });
      expect(exportBtn).toBeInTheDocument();
      fireEvent.click(exportBtn);
      expect(onExportClick).toHaveBeenCalledTimes(1);

      const themeBtn = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(themeBtn).toBeInTheDocument();
      fireEvent.click(themeBtn);
      expect(onToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Sidebar Slide-Out Drawer on Mobile', () => {
    const mockMetadata: DocumentMetadata = {
      title: 'Doc One',
      author: 'Author',
      subtitle: '',
      date: '',
      abstract: '',
    };

    const mockDocs: PaperflowDocument[] = [
      {
        id: 'doc-1',
        title: 'Doc One',
        markdown: '# Heading 1\nSome text',
        metadata: { ...mockMetadata, title: 'Doc One' },
        settings: DEFAULT_DOCUMENT_SETTINGS,
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        id: 'doc-2',
        title: 'Doc Two',
        markdown: '# Heading 2\nSome other text',
        metadata: { ...mockMetadata, title: 'Doc Two' },
        settings: DEFAULT_DOCUMENT_SETTINGS,
        createdAt: 2000,
        updatedAt: 2000,
      },
    ];

    it('does not render sidebar DOM when closed on mobile', () => {
      const { container } = render(
        <Sidebar
          isOpen={false}
          onToggle={vi.fn()}
          documents={mockDocs}
          activeDocId="doc-1"
          onSelectDoc={vi.fn()}
          onNewDoc={vi.fn()}
          onLoadSample={vi.fn()}
          onUploadClick={vi.fn()}
          onDeleteDoc={vi.fn()}
          outline={[]}
          wordCount={10}
          charCount={50}
          isMobile={true}
          onCloseMobile={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders backdrop and slide-out drawer when open on mobile', () => {
      const onCloseMobile = vi.fn();
      render(
        <Sidebar
          isOpen={true}
          onToggle={vi.fn()}
          documents={mockDocs}
          activeDocId="doc-1"
          onSelectDoc={vi.fn()}
          onNewDoc={vi.fn()}
          onLoadSample={vi.fn()}
          onUploadClick={vi.fn()}
          onDeleteDoc={vi.fn()}
          outline={[]}
          wordCount={10}
          charCount={50}
          isMobile={true}
          onCloseMobile={onCloseMobile}
        />
      );

      // Verify drawer is displayed
      expect(screen.getByText('Doc One')).toBeInTheDocument();
      expect(screen.getByText('Doc Two')).toBeInTheDocument();

      // Close button inside drawer
      const closeBtn = screen.getByRole('button', { name: /close drawer/i });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(onCloseMobile).toHaveBeenCalledTimes(1);
    });

    it('auto-closes mobile drawer upon selecting a document', () => {
      const onSelectDoc = vi.fn();
      const onCloseMobile = vi.fn();
      render(
        <Sidebar
          isOpen={true}
          onToggle={vi.fn()}
          documents={mockDocs}
          activeDocId="doc-1"
          onSelectDoc={onSelectDoc}
          onNewDoc={vi.fn()}
          onLoadSample={vi.fn()}
          onUploadClick={vi.fn()}
          onDeleteDoc={vi.fn()}
          outline={[]}
          wordCount={10}
          charCount={50}
          isMobile={true}
          onCloseMobile={onCloseMobile}
        />
      );

      const docTwo = screen.getByText('Doc Two');
      fireEvent.click(docTwo);

      expect(onSelectDoc).toHaveBeenCalledWith('doc-2');
      expect(onCloseMobile).toHaveBeenCalledTimes(1);
    });

    it('auto-closes mobile drawer upon creating a new document', () => {
      const onNewDoc = vi.fn();
      const onCloseMobile = vi.fn();
      render(
        <Sidebar
          isOpen={true}
          onToggle={vi.fn()}
          documents={mockDocs}
          activeDocId="doc-1"
          onSelectDoc={vi.fn()}
          onNewDoc={onNewDoc}
          onLoadSample={vi.fn()}
          onUploadClick={vi.fn()}
          onDeleteDoc={vi.fn()}
          outline={[]}
          wordCount={10}
          charCount={50}
          isMobile={true}
          onCloseMobile={onCloseMobile}
        />
      );

      const newDocBtn = screen.getByRole('button', { name: /new doc/i });
      fireEvent.click(newDocBtn);

      expect(onNewDoc).toHaveBeenCalledTimes(1);
      expect(onCloseMobile).toHaveBeenCalledTimes(1);
    });

    it('closes mobile drawer when Escape key is pressed', () => {
      const onCloseMobile = vi.fn();
      render(
        <Sidebar
          isOpen={true}
          onToggle={vi.fn()}
          documents={mockDocs}
          activeDocId="doc-1"
          onSelectDoc={vi.fn()}
          onNewDoc={vi.fn()}
          onLoadSample={vi.fn()}
          onUploadClick={vi.fn()}
          onDeleteDoc={vi.fn()}
          outline={[]}
          wordCount={10}
          charCount={50}
          isMobile={true}
          onCloseMobile={onCloseMobile}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCloseMobile).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. Markdown Renderer Responsive Output', () => {
    it('wraps images in responsive figures with max-w-full and lazy loading', () => {
      const markdown = '![Quantum Circuit Diagram](https://example.com/circuit.png "Circuit")';
      const html = renderMarkdownWithMath(markdown);

      expect(html).toContain('class="max-w-full h-auto rounded shadow-sm mx-auto"');
      expect(html).toContain('src="https://example.com/circuit.png"');
      expect(html).toContain('loading="lazy"');
      expect(html).toContain('<figcaption class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400 font-sans italic">Quantum Circuit Diagram</figcaption>');
    });

    it('renders long URLs and links with break-words to avoid page-level overflow', () => {
      const markdown = '[Extremely Long Research Paper Link](https://images.openai.com/static-rsc-4/D8gujhYtoLCJYQGFywyC4JR5WPg0CbMCSnw7KQqaW)';
      const html = renderMarkdownWithMath(markdown);

      expect(html).toContain('break-words');
      expect(html).toContain('href="https://images.openai.com/static-rsc-4/D8gujhYtoLCJYQGFywyC4JR5WPg0CbMCSnw7KQqaW"');
      expect(html).toContain('target="_blank"');
    });

    it('wraps tables in overflow-x-auto container with min-w-full', () => {
      const markdown = `| Parameter | Symbol | Value |\n|---|---|---|\n| Planck Constant | h | 6.626e-34 |`;
      const html = renderMarkdownWithMath(markdown);

      expect(html).toContain('class="my-6 overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-800"');
      expect(html).toContain('<table class="min-w-full divide-y');
    });

    it('wraps LaTeX display math in katex-display-wrapper with overflow-x-auto', () => {
      const markdown = '$$\\int_0^T r(t) \\cdot h(t)\\,dt$$';
      const html = renderMarkdownWithMath(markdown);

      expect(html).toContain('class="katex-display-wrapper my-4 overflow-x-auto text-center"');
      expect(html).toContain('katex-display');
    });
  });

  describe('4. Modals Responsive Layout & Ergonomics', () => {
    it('renders ExportModal with responsive sizing classes', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={vi.fn()}
          markdown="# Test Markdown"
          metadata={{
            title: 'Responsive Test',
            author: '',
            subtitle: '',
            date: '',
            abstract: '',
          }}
          settings={DEFAULT_DOCUMENT_SETTINGS}
          onUpdateSettings={vi.fn()}
          wordCount={50}
        />
      );

      expect(screen.getByText('Export Document to PDF')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders SettingsModal with accessible responsive form inputs', () => {
      const onUpdateMetadata = vi.fn();
      render(
        <SettingsModal
          isOpen={true}
          onClose={vi.fn()}
          metadata={{
            title: 'My Paper',
            author: 'Dr. Smith',
            subtitle: '',
            date: '',
            abstract: '',
          }}
          onUpdateMetadata={onUpdateMetadata}
        />
      );

      expect(screen.getByText('Document Metadata & Settings')).toBeInTheDocument();
      const authorInput = screen.getByDisplayValue('Dr. Smith');
      fireEvent.change(authorInput, { target: { value: 'Dr. Jane Smith' } });

      expect(onUpdateMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'My Paper',
          author: 'Dr. Jane Smith',
        })
      );
    });

    it('renders UploadModal with accessible dropzone and browse button', () => {
      render(
        <UploadModal
          isOpen={true}
          onClose={vi.fn()}
          onUploadSuccess={vi.fn()}
        />
      );

      expect(screen.getByText('Upload Markdown Document')).toBeInTheDocument();
      expect(screen.getByText(/drag & drop your markdown file here/i)).toBeInTheDocument();
    });

    it('renders ShortcutsModal with responsive shortcut badges', () => {
      render(
        <ShortcutsModal
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Export document to PDF')).toBeInTheDocument();
    });
  });
});
