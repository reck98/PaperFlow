import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { EditorPage } from './pages/EditorPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'editor'>('landing');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
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
    setCurrentPage('editor');
  };

  const handleLoadSampleFromLanding = (sampleId: string) => {
    setSelectedSampleId(sampleId);
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
        />
      )}
    </div>
  );
}

export default App;
