import React, { useEffect, useRef } from 'react';
import { EditorState, Extension } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  indentOnInput,
} from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  documentId?: string;
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
  onDropFile?: (file: File) => void;
  onExportPdf?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  documentId,
  value,
  onChange,
  isDarkMode,
  onDropFile,
  onExportPdf,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const currentDocIdRef = useRef<string | undefined>(documentId);
  const isExternalDispatchRef = useRef(false);

  // Keep references to latest callbacks to avoid stale closures
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onExportPdfRef = useRef(onExportPdf);
  onExportPdfRef.current = onExportPdf;

  const getBaseTheme = (darkMode: boolean) =>
    EditorView.theme({
      '&': {
        height: '100%',
        width: '100%',
        fontSize: '14px',
        backgroundColor: 'transparent',
      },
      '.cm-scroller': {
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        lineHeight: '1.65',
        overflowX: 'hidden',
        touchAction: 'pan-y',
      },
      '.cm-content': {
        padding: '12px 0',
        caretColor: darkMode ? '#f59e0b' : '#b45309',
      },
      '.cm-line': {
        padding: '0 10px',
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        borderRight: '1px solid ' + (darkMode ? '#272b30' : '#e5e3dd'),
        color: darkMode ? '#6b7280' : '#9ca3af',
        paddingRight: '4px',
      },
      '.cm-activeLine': {
        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: darkMode ? '#f59e0b' : '#b45309',
        fontWeight: 'bold',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: darkMode ? '#f59e0b' : '#b45309',
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: darkMode
          ? 'rgba(217, 119, 6, 0.25) !important'
          : 'rgba(251, 191, 36, 0.3) !important',
      },
    });

  const buildExtensions = (darkMode: boolean): Extension[] => [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    markdown(),
    EditorView.lineWrapping,
    getBaseTheme(darkMode),
    darkMode ? oneDark : [],
    keymap.of([
      indentWithTab,
      {
        key: 'Mod-Enter',
        run: () => {
          if (onExportPdfRef.current) {
            onExportPdfRef.current();
            return true;
          }
          return false;
        },
      },
      ...defaultKeymap,
      ...historyKeymap,
    ]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged && !isExternalDispatchRef.current) {
        onChangeRef.current(update.state.doc.toString());
      }
    }),
  ];

  // Initialize CodeMirror instance
  useEffect(() => {
    if (!containerRef.current) return;

    currentDocIdRef.current = documentId;

    const state = EditorState.create({
      doc: value,
      extensions: buildExtensions(isDarkMode),
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    editorRef.current = view;

    return () => {
      view.destroy();
      editorRef.current = null;
    };
  }, [isDarkMode]);

  // Synchronize document changes safely
  useEffect(() => {
    if (!editorRef.current) return;

    // If document changed, cleanly reset the editor state for the new document
    if (documentId !== undefined && currentDocIdRef.current !== documentId) {
      currentDocIdRef.current = documentId;
      isExternalDispatchRef.current = true;
      try {
        const newState = EditorState.create({
          doc: value,
          extensions: buildExtensions(isDarkMode),
        });
        editorRef.current.setState(newState);
      } finally {
        isExternalDispatchRef.current = false;
      }
      return;
    }

    // If same document, sync any external value change without losing cursor/history if possible
    const currentText = editorRef.current.state.doc.toString();
    if (currentText !== value) {
      isExternalDispatchRef.current = true;
      try {
        editorRef.current.dispatch({
          changes: { from: 0, to: currentText.length, insert: value },
        });
      } finally {
        isExternalDispatchRef.current = false;
      }
    }
  }, [documentId, value, isDarkMode]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onDropFile) {
      onDropFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="h-full w-full overflow-hidden select-text"
    />
  );
};
