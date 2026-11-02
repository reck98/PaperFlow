import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { EditorPage } from './pages/EditorPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'editor'>(() => {
    if (typeof window !== 'undefined' && (window.location.hash === '#editor' || window.location.search.includes('view=editor'))) {
      return 'editor';
    }
    return 'landing';
  });
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [openBlankOnLoad, setOpenBlankOnLoad] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('paperflow_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('paperflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('paperflow_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleStartWriting = () => {
    setSelectedSampleId(null);
    setOpenBlankOnLoad(false);
    setCurrentPage('editor');
  };

  const handleOpenBlankDocument = () => {
    setSelectedSampleId(null);
    setOpenBlankOnLoad(true);
    setCurrentPage('editor');
  };

  const handleLoadSampleFromLanding = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setOpenBlankOnLoad(false);
    setCurrentPage('editor');
  };

  const handleGoHome = () => {
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' ? (
        <LandingPage
          onStartWriting={handleStartWriting}
          onOpenBlankDocument={handleOpenBlankDocument}
          onLoadSample={handleLoadSampleFromLanding}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <EditorPage
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onGoHome={handleGoHome}
          initialSampleId={selectedSampleId}
          openBlankOnLoad={openBlankOnLoad}
          onConsumeBlankOnLoad={() => setOpenBlankOnLoad(false)}
        />
      )}
    </div>
  );
}

export default App;
