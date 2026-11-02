import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { EditorPage } from '../pages/EditorPage';
import { LandingPage } from '../pages/LandingPage';
import { App } from '../App';
import * as api from '../services/api';
import {
  getAllDocuments,
  saveDocument,
  createNewDocument,
  setActiveDocId,
} from '../services/db';
import { SAMPLE_DOCUMENTS } from '../samples';

// Mock exportPdfApi to inspect parameters passed to PDF generation
vi.spyOn(api, 'exportPdfApi').mockImplementation(async () => {
  return new Blob(['fake-pdf'], { type: 'application/pdf' });
});

describe('Paperflow Document State & Management Regression Tests', () => {
  beforeEach(async () => {
    localStorage.clear();
    // Clear indexedDB between tests
    const docs = await getAllDocuments();
    const { deleteDocument } = await import('../services/db');
    for (const doc of docs) {
      await deleteDocument(doc.id);
    }
  });

  /**
   * Test 1: Selecting another document
   * 1. Create document A with content `# Document A`.
   * 2. Create document B with content `# Document B`.
   * 3. Select A.
   * 4. Verify editor, preview and header display A.
   * 5. Select B.
   * 6. Verify editor, preview and header display B.
   * 7. Switch back to A.
   * 8. Verify A's original content remains intact.
   */
  it('Test 1: Selecting another document switches content completely and preserves original contents', async () => {
    const docA = createNewDocument('Document A', '# Document A Heading\n\nContent for A');
    const docB = createNewDocument('Document B', '# Document B Heading\n\nContent for B');
    await saveDocument(docA);
    await saveDocument(docB);
    setActiveDocId(docA.id);

    render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
      />
    );

    // Wait for initial load
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Document A');
    });

    // 4. Verify editor and preview display A
    expect(screen.getAllByText('Content for A').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Content for B')).not.toBeInTheDocument();

    // 5. Select Document B from sidebar
    const docBItems = screen.getAllByText('Document B');
    const sidebarDocB = docBItems[docBItems.length - 1];
    await act(async () => {
      fireEvent.click(sidebarDocB);
    });

    // 6. Verify editor, preview and header display B
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Document B');
    });
    expect(screen.getAllByText('Content for B').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Content for A')).not.toBeInTheDocument();

    // 7. Switch back to A
    const docAItems = screen.getAllByText('Document A');
    const sidebarDocA = docAItems[docAItems.length - 1];
    await act(async () => {
      fireEvent.click(sidebarDocA);
    });

    // 8. Verify A's original content remains intact
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Document A');
    });
    expect(screen.getAllByText('Content for A').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Content for B')).not.toBeInTheDocument();
  });

  /**
   * Test 2: Creating a new document
   * 1. Load a sample document.
   * 2. Click New Doc.
   * 3. Verify the new document is empty apart from the default template.
   * 4. Verify the sample document still exists.
   * 5. Verify the IDs are different.
   * 6. Create another document.
   * 7. Verify the second new document is independent of the first.
   */
  it('Test 2: Creating a new document generates fresh template and independent IDs', async () => {
    const sample = SAMPLE_DOCUMENTS[0];
    render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
        initialSampleId={sample.id}
      />
    );

    // Wait for sample document to load
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent(sample.title);
    });

    // 2. Click New Doc
    const newDocButton = screen.getByRole('button', { name: /New Doc/i });
    await act(async () => {
      fireEvent.click(newDocButton);
    });

    // 3. Verify the new document is active with default template in editor/preview
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Untitled Document');
    });
    expect(screen.getAllByText('Start writing your document here...').length).toBeGreaterThanOrEqual(1);

    // 4. Verify sample document still exists in recent documents sidebar
    const sampleTitles = screen.getAllByText(sample.title);
    expect(sampleTitles.length).toBeGreaterThanOrEqual(1);

    // 5. Verify documents have different IDs in IndexedDB
    const docsAfterNew = await getAllDocuments();
    expect(docsAfterNew.length).toBe(2);
    expect(docsAfterNew[0].id).not.toBe(docsAfterNew[1].id);

    // 6. Create another document
    await act(async () => {
      fireEvent.click(newDocButton);
    });

    // 7. Verify second new document is independent
    await waitFor(async () => {
      const docsAfterSecondNew = await getAllDocuments();
      expect(docsAfterSecondNew.length).toBe(3);
      const ids = new Set(docsAfterSecondNew.map((d) => d.id));
      expect(ids.size).toBe(3);
    });
  });

  /**
   * Test 3: Editing and switching
   * 1. Open document A.
   * 2. Modify its content.
   * 3. Switch to document B.
   * 4. Edit document B.
   * 5. Return to document A.
   * 6. Verify A contains its own edits.
   * 7. Verify B contains only its own edits.
   */
  it('Test 3: Editing and switching retains edits per document without cross-contamination', async () => {
    const docA = createNewDocument('Document A', '# Document A Initial');
    const docB = createNewDocument('Document B', '# Document B Initial');
    await saveDocument(docA);
    await saveDocument(docB);
    setActiveDocId(docA.id);

    const { unmount } = render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('Document A Initial').length).toBeGreaterThanOrEqual(1);
    });

    // 2. Modify Document A's title
    const renameButtonA = screen.getByTitle('Click to rename document');
    fireEvent.click(renameButtonA);
    const titleInputA = screen.getByDisplayValue('Document A');
    fireEvent.change(titleInputA, { target: { value: 'Document A Edited' } });
    fireEvent.blur(titleInputA);

    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Document A Edited');
    });

    // 3. Switch to Document B
    const docBItems = screen.getAllByText('Document B');
    const sidebarDocB = docBItems[docBItems.length - 1];
    await act(async () => {
      fireEvent.click(sidebarDocB);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Document B Initial').length).toBeGreaterThanOrEqual(1);
    });

    // 4. Edit Document B's title
    const renameButtonB = screen.getByTitle('Click to rename document');
    fireEvent.click(renameButtonB);
    const titleInputB = screen.getByDisplayValue('Document B');
    fireEvent.change(titleInputB, { target: { value: 'Document B Edited' } });
    fireEvent.blur(titleInputB);

    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Document B Edited');
    });

    // 5. Return to Document A
    const docAEditedItems = screen.getAllByText('Document A Edited');
    const sidebarDocAEdited = docAEditedItems[docAEditedItems.length - 1];
    await act(async () => {
      fireEvent.click(sidebarDocAEdited);
    });

    // 6 & 7. Verify A contains its own edits and B contains its own edits
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Document A Edited');
    });

    unmount();

    // Verify in database that both persisted their separate edits
    const savedDocs = await getAllDocuments();
    const savedA = savedDocs.find((d) => d.id === docA.id);
    const savedB = savedDocs.find((d) => d.id === docB.id);

    expect(savedA?.title).toBe('Document A Edited');
    expect(savedB?.title).toBe('Document B Edited');
  });

  /**
   * Test 4: Persistence
   * 1. Create multiple documents.
   * 2. Edit each document independently.
   * 3. Reload the browser (remount EditorPage).
   * 4. Verify all documents are restored.
   * 5. Verify the correct active document is restored.
   * 6. Verify their contents have not been mixed.
   */
  it('Test 4: Restores all documents and restores the previously active document accurately', async () => {
    const doc1 = createNewDocument('Paper 1', '# Physics Study\n\nQuantum mechanics details');
    const doc2 = createNewDocument('Paper 2', '# Biology Study\n\nCellular respiration details');
    await saveDocument(doc1);
    await saveDocument(doc2);
    // Mark Paper 2 as active
    setActiveDocId(doc2.id);

    const { unmount } = render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
      />
    );

    // Verify Paper 2 is active on load because of saved active doc ID
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Paper 2');
      expect(screen.getAllByText('Cellular respiration details').length).toBeGreaterThanOrEqual(1);
    });

    // Both documents must be in sidebar
    expect(screen.getAllByText('Paper 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Paper 2').length).toBeGreaterThanOrEqual(1);

    unmount();

    // Switch active ID to doc1 and simulate reload
    setActiveDocId(doc1.id);
    render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
      />
    );

    // Verify Paper 1 is now restored as active document
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Paper 1');
      expect(screen.getAllByText('Quantum mechanics details').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.queryByText('Cellular respiration details')).not.toBeInTheDocument();
  });

  /**
   * Test 5: PDF export
   * 1. Open document A.
   * 2. Export its PDF.
   * 3. Open document B.
   * 4. Export its PDF.
   * 5. Verify that each PDF contains the correct document title and content.
   */
  it('Test 5: PDF export always uses the currently selected document content and metadata', async () => {
    const docA = createNewDocument('Doc A Title', '# Doc A Markdown Content');
    const docB = createNewDocument('Doc B Title', '# Doc B Markdown Content');
    await saveDocument(docA);
    await saveDocument(docB);
    setActiveDocId(docA.id);

    render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('Doc A Markdown Content').length).toBeGreaterThanOrEqual(1);
    });

    // 2. Open export modal for Document A
    const exportButton = screen.getByRole('button', { name: /Export PDF/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('Export Document to PDF')).toBeInTheDocument();
    });

    const generateBtn = screen.getByRole('button', { name: /^Generate PDF/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Verify exportPdfApi was called with Doc A
    expect(api.exportPdfApi).toHaveBeenLastCalledWith(
      expect.objectContaining({
        markdown: '# Doc A Markdown Content',
        metadata: expect.objectContaining({
          title: 'Doc A Title',
        }),
      })
    );

    // Close export modal
    const closeBtn = screen.getAllByRole('button').find((b) => b.querySelector('svg.lucide-x'));
    if (closeBtn) {
      await act(async () => {
        fireEvent.click(closeBtn);
      });
    }

    // 3. Switch to Document B
    const docBItems = screen.getAllByText('Doc B Title');
    const sidebarDocB = docBItems[docBItems.length - 1];
    await act(async () => {
      fireEvent.click(sidebarDocB);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Doc B Markdown Content').length).toBeGreaterThanOrEqual(1);
    });

    // 4. Export PDF for Document B
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Export PDF/i }));
    });
    await waitFor(() => {
      expect(screen.getByText('Export Document to PDF')).toBeInTheDocument();
    });

    const generateBtnB = screen.getByRole('button', { name: /^Generate PDF/i });
    await act(async () => {
      fireEvent.click(generateBtnB);
    });

    // 5. Verify exportPdfApi was called with Doc B
    expect(api.exportPdfApi).toHaveBeenLastCalledWith(
      expect.objectContaining({
        markdown: '# Doc B Markdown Content',
        metadata: expect.objectContaining({
          title: 'Doc B Title',
        }),
      })
    );
  });

  /**
   * Test 6: Sample isolation
   * 1. Load a sample document.
   * 2. Edit the sample.
   * 3. Create a new document.
   * 4. Verify the new document has no sample content.
   * 5. Switch back to the sample.
   * 6. Verify the sample's edits are retained.
   */
  it('Test 6: Sample documents are completely isolated from new documents and retain their edits', async () => {
    const sample = SAMPLE_DOCUMENTS[1]; // Machine Learning sample
    render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
        initialSampleId={sample.id}
      />
    );

    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent(sample.title);
    });

    // 2. Edit the sample's title
    const renameButton = screen.getByTitle('Click to rename document');
    fireEvent.click(renameButton);
    const titleInput = screen.getByDisplayValue(sample.title);
    fireEvent.change(titleInput, { target: { value: 'My Custom ML Notes' } });
    fireEvent.blur(titleInput);

    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('My Custom ML Notes');
    });

    // 3. Create a new document
    const newDocButton = screen.getByRole('button', { name: /New Doc/i });
    await act(async () => {
      fireEvent.click(newDocButton);
    });

    // 4. Verify new document has NO sample content and displays default template
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('Untitled Document');
    });
    expect(screen.getAllByText('Start writing your document here...').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Empirical Risk Minimization')).not.toBeInTheDocument();

    // 5. Switch back to the edited sample
    const sampleInSidebar = screen.getAllByText('My Custom ML Notes');
    const sidebarItem = sampleInSidebar[sampleInSidebar.length - 1];
    await act(async () => {
      fireEvent.click(sidebarItem);
    });

    // 6. Verify sample's edits are retained and sample content is restored
    await waitFor(() => {
      const headerRenameBtn = screen.getByTitle('Click to rename document');
      expect(headerRenameBtn).toHaveTextContent('My Custom ML Notes');
    });
    expect(screen.getAllByText(/Empirical Risk Minimization/i).length).toBeGreaterThanOrEqual(1);
  });

  /**
   * Test 7: Rapid switching between documents
   */
  it('Test 7: Rapid switching between multiple documents updates active document reliably', async () => {
    const doc1 = createNewDocument('Doc 1', '# Content 1');
    const doc2 = createNewDocument('Doc 2', '# Content 2');
    const doc3 = createNewDocument('Doc 3', '# Content 3');
    await saveDocument(doc1);
    await saveDocument(doc2);
    await saveDocument(doc3);
    setActiveDocId(doc1.id);

    render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTitle('Click to rename document')).toHaveTextContent('Doc 1');
    });

    // Rapidly click between Doc 2, Doc 3, and back to Doc 2
    const doc2Items = screen.getAllByText('Doc 2');
    const sidebarDoc2 = doc2Items[doc2Items.length - 1];
    const doc3Items = screen.getAllByText('Doc 3');
    const sidebarDoc3 = doc3Items[doc3Items.length - 1];

    await act(async () => {
      fireEvent.click(sidebarDoc2);
      fireEvent.click(sidebarDoc3);
      fireEvent.click(sidebarDoc2);
    });

    await waitFor(() => {
      expect(screen.getByTitle('Click to rename document')).toHaveTextContent('Doc 2');
    });
    expect(screen.getAllByText('Content 2').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
  });

  /**
   * Test 8: Consecutively creating several documents
   */
  it('Test 8: Consecutively creating several documents creates independent documents with unique IDs', async () => {
    render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTitle('Click to rename document')).toBeInTheDocument();
    });

    const newDocButton = screen.getByRole('button', { name: /New Doc/i });

    // Click New Doc 3 times consecutively
    await act(async () => {
      fireEvent.click(newDocButton);
    });
    await act(async () => {
      fireEvent.click(newDocButton);
    });
    await act(async () => {
      fireEvent.click(newDocButton);
    });

    await waitFor(async () => {
      const allDocs = await getAllDocuments();
      expect(allDocs.length).toBeGreaterThanOrEqual(4); // 1 initial + 3 created
      const ids = new Set(allDocs.map((d) => d.id));
      expect(ids.size).toBe(allDocs.length); // Every single ID is unique
    });
  });

  /**
   * Test 9: Footer links and creator attribution
   */
  it('Test 9: Footer displays repository link and creator attribution hyperlink', () => {
    render(
      <LandingPage
        onStartWriting={() => {}}
        onLoadSample={() => {}}
        isDarkMode={false}
        onToggleTheme={() => {}}
      />
    );

    // Verify GitHub repository link
    const githubLink = screen.getByRole('link', { name: /^github$/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/reck98/PaperFlow');

    // Verify creator attribution
    const creatorLink = screen.getByRole('link', { name: /reck98/i });
    expect(creatorLink).toHaveAttribute('href', 'https://github.com/reck98');
    expect(screen.getByText(/Made with ❤️ by/i)).toBeInTheDocument();
  });

  /**
   * Test 10: "Open Blank Document" creates and opens a fresh blank document
   */
  it('Test 10: Clicking Open Blank Document opens a fresh blank document instead of existing loaded documents', async () => {
    // Pre-populate IndexedDB with an existing document
    const existingDoc = createNewDocument(
      'Quantum Mechanics Existing Doc',
      '# Quantum Mechanics\n\nExisting sample content that should NOT be displayed when opening a blank doc.'
    );
    await saveDocument(existingDoc);
    setActiveDocId(existingDoc.id);

    render(<App />);

    // Initially on landing page
    const openBlankBtn = screen.getByRole('button', { name: /Open Blank Document/i });
    expect(openBlankBtn).toBeInTheDocument();

    // Click "Open Blank Document"
    await act(async () => {
      fireEvent.click(openBlankBtn);
    });

    // Should navigate to Editor and display a brand new Untitled Document
    await waitFor(() => {
      const renameBtn = screen.getByTitle('Click to rename document');
      expect(renameBtn).toHaveTextContent('Untitled Document');
    });

    // Editor and preview should show fresh blank template, not the existing doc content
    expect(screen.getAllByText(/Start writing your document here/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Existing sample content that should NOT be displayed/i)).not.toBeInTheDocument();
  });
});
