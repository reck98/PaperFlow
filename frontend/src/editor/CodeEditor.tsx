import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
  onDropFile?: (file: File) => void;
  onExportPdf?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  isDarkMode,
  onDropFile,
  onExportPdf,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const baseTheme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '13.5px',
        backgroundColor: 'transparent',
      },
      '.cm-scroller': {
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        lineHeight: '1.65',
      },
      '.cm-content': {
        padding: '16px 0',
        caretColor: isDarkMode ? '#f59e0b' : '#b45309',
      },
      '.cm-line': {
        padding: '0 16px',
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        borderRight: '1px solid ' + (isDarkMode ? '#272b30' : '#e5e3dd'),
        color: isDarkMode ? '#6b7280' : '#9ca3af',
        paddingRight: '6px',
      },
      '.cm-activeLine': {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: isDarkMode ? '#f59e0b' : '#b45309',
        fontWeight: 'bold',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: isDarkMode ? '#f59e0b' : '#b45309',
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: isDarkMode ? 'rgba(217, 119, 6, 0.25) !important' : 'rgba(251, 191, 36, 0.3) !important',
      },
    });

    const customKeymaps = keymap.of([
      indentWithTab,
      {
        key: 'Mod-Enter',
        run: () => {
          if (onExportPdf) {
            onExportPdf();
            return true;
          }
          return false;
        },
      },
      ...defaultKeymap,
      ...historyKeymap,
    ]);

    const state = EditorState.create({
      doc: value,
      extensions: [
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
        baseTheme,
        isDarkMode ? oneDark : [],
        customKeymaps,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            isInternalChangeRef.current = true;
            onChange(update.state.doc.toString());
            isInternalChangeRef.current = false;
          }
        }),
      ],
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

  // Sync external changes (e.g., loading a sample or uploading a file)
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      const currentDoc = editorRef.current.state.doc.toString();
      if (currentDoc !== value) {
        editorRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: value },
        });
      }
    }
  }, [value]);

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
