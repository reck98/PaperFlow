import React, { useState } from 'react';
import {
  ArrowRight,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../samples';

interface LandingPageProps {
  onStartWriting: () => void;
  onLoadSample: (sampleId: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartWriting,
  onLoadSample,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-[100dvh] bg-[#faf9f6] text-[#141716] dark:bg-[#0c0e0f] dark:text-[#ededed] flex flex-col font-sans transition-colors">
      {/* Navigation */}
      <nav className="h-16 px-6 sm:px-12 flex items-center justify-between select-none max-w-7xl w-full mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-amber-700 dark:bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-base">
            P
          </div>
          <span className="font-semibold text-base tracking-tight font-serif">Paperflow</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-xs font-medium text-gray-600 dark:text-gray-400">
          <a href="#features" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            How it works
          </a>
          <a href="#samples" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            Presets and Math
          </a>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onStartWriting}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded text-xs sm:text-sm font-medium transition-colors active:scale-95"
          >
            <span>Start Writing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-gray-950 dark:text-gray-50 leading-[1.12] mb-6">
            Your Markdown deserves a better PDF.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-normal leading-relaxed mb-8 max-w-2xl">
            Write, preview, and transform Markdown into beautifully typeset documents.
            Mathematical equations, technical notes, and academic papers directly in your browser.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onStartWriting}
              className="flex items-center space-x-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded font-medium text-sm transition-colors active:scale-95"
            >
              <span>Start Writing Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#features"
              className="px-5 py-3 rounded font-medium text-sm text-gray-700 dark:text-gray-300 bg-gray-200/50 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Visual Product Preview: Live Interface Fragment marked data-ui */}
        <div data-ui="true" className="mt-8 rounded-lg border border-[#e2dfd7] dark:border-[#262a2f] bg-white dark:bg-[#131518] overflow-hidden">
          {/* Mock App Header */}
          <div className="h-10 px-4 border-b border-gray-200 dark:border-gray-800 bg-[#f7f5ef] dark:bg-[#181b1e] flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
              <span className="ml-3 text-[11px] text-gray-700 dark:text-gray-300">
                theoretical_physics.md (Academic Preset)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
                Vector Math Ready
              </span>
            </div>
          </div>

          {/* Interactive Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[460px]">
            {/* Left: Raw Markdown Editor with Math */}
            <div className="p-6 text-xs leading-relaxed bg-[#fbfbfa] dark:bg-[#0f1113] overflow-x-auto text-gray-800 dark:text-gray-300 select-none">
              <div className="text-gray-400 pb-2 mb-2 text-[10px] uppercase font-bold tracking-wider">
                Markdown Source
              </div>
              <code>
                <p className="text-amber-800 dark:text-amber-500 font-bold"># Special Relativity and Wave Equations</p>
                <p className="mt-3 text-gray-500">// Invariance of interval:</p>
                <p className="text-blue-700 dark:text-blue-400">$$ds^2 = \eta_&#123;\mu\nu&#125; dx^\mu dx^\nu$$</p>
                <p className="mt-3">The mass-energy relation for a particle with rest mass $m_0$:</p>
                <p className="text-blue-700 dark:text-blue-400 mt-2">$$E^2 = (m_0 c^2)^2 + (\mathbf&#123;p&#125; c)^2$$</p>
                <p className="mt-3">In the rest frame where $\mathbf&#123;p&#125; = \mathbf&#123;0&#125;$:</p>
                <p className="text-blue-700 dark:text-blue-400 mt-2 font-bold">$$E = m_0 c^2$$</p>
                <p className="mt-4 text-amber-800 dark:text-amber-400 font-bold">### Maxwell's Equations</p>
                <p className="text-blue-700 dark:text-blue-400 mt-1">$$\nabla \times \mathbf&#123;E&#125; = -\frac&#123;\partial \mathbf&#123;B&#125;&#125;&#123;\partial t&#125;$$</p>
              </code>
            </div>

            {/* Right: Rendered Typeset Document Preview */}
            <div className="p-8 bg-white dark:bg-[#15171a] font-serif overflow-x-auto select-none">
              <div className="text-gray-400 pb-2 mb-4 text-[10px] font-sans uppercase font-bold tracking-wider flex justify-between items-center">
                <span>Typeset Output Preview</span>
                <span className="text-amber-700 dark:text-amber-400 lowercase">page 1 of 4</span>
              </div>

              <h2 className="text-2xl font-bold font-serif text-gray-950 dark:text-gray-50 tracking-tight">
                Special Relativity and Wave Equations
              </h2>
              <div className="text-xs font-sans text-gray-500 mt-1 mb-4 italic">
                Dr. Julian S. Schwinger, Department of Physics
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-sans mb-3">
                The spacetime interval in four-dimensional Minkowski geometry is strictly invariant under Lorentz transformations:
              </p>

              <div className="my-3 py-2 text-center text-sm font-serif bg-gray-50/60 dark:bg-gray-800/30 rounded">
                <span className="font-serif italic text-base">ds</span>² = η<sub>μν</sub> <span className="font-serif italic">dx</span><sup>μ</sup> <span className="font-serif italic">dx</span><sup>ν</sup>
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-sans mb-3">
                In the rest frame where relativistic momentum vanishes, this reduces to:
              </p>

              <div className="my-3 py-2 text-center font-serif text-lg font-bold text-amber-900 dark:text-amber-200 bg-amber-50/40 dark:bg-amber-950/20 rounded">
                <span className="italic">E</span> = <span className="italic">m</span>₀ <span className="italic">c</span>²
              </div>

              <div className="mt-4 pt-3 flex justify-between items-center text-[11px] font-sans text-gray-400">
                <span>Typeset with Pandoc & Typst</span>
                <span>Sharp 1200 DPI Vector PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full bg-[#f4f2ec] dark:bg-[#0f1114] rounded-2xl my-8">
        <div className="max-w-2xl mb-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-3">
            Designed for technical rigor and editorial clarity.
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Every feature in Paperflow exists to make document creation focused, beautiful, and precise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="p-6 rounded bg-white dark:bg-[#15171a] space-y-3">
            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Beautiful PDF Exports
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              No low-res browser screenshot hacks. Real, vector-typeset documents with crisp fonts, proper page breaks, and selectable text.
            </p>
          </div>

          <div className="p-6 rounded bg-white dark:bg-[#15171a] space-y-3">
            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Native Mathematical Typesetting
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              First-class support for inline ($E=mc^2$) and display equations, matrices, integrals, summations, and aligned structures.
            </p>
          </div>

          <div className="p-6 rounded bg-white dark:bg-[#15171a] space-y-3">
            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Instant Live Preview
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Sub-millisecond KaTeX preview updates as you type. Real-time document sheet view with outline navigation.
            </p>
          </div>

          <div className="p-6 rounded bg-white dark:bg-[#15171a] space-y-3">
            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Upload or Paste Directly
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Drop `.md`, `.markdown`, or `.txt` files directly onto the editor. Imports markdown without mangling equations.
            </p>
          </div>

          <div className="p-6 rounded bg-white dark:bg-[#15171a] space-y-3">
            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              5
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Four Professional Presets
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Switch between Academic Notes, Technical Documentation, Minimal Editorial, and Two-Column Research Paper presets.
            </p>
          </div>

          <div className="p-6 rounded bg-white dark:bg-[#15171a] space-y-3">
            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              6
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Privacy-First Local Storage
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              No account required. Documents are stored safely in your browser’s IndexedDB. PDF compilation is ephemeral.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="max-w-xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-3">
            How it works
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Three simple steps to publish your thoughts into publication-grade documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 p-6 rounded bg-gray-50/70 dark:bg-gray-900/40">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-500">
              STEP 01
            </div>
            <h3 className="text-base font-semibold font-serif">
              Write or upload Markdown
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Type directly in the distraction-free CodeMirror editor or drag and drop your existing notes. Include LaTeX math freely.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded bg-gray-50/70 dark:bg-gray-900/40">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-500">
              STEP 02
            </div>
            <h3 className="text-base font-semibold font-serif">
              Customize and preview
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Choose an aesthetic preset, adjust margins, toggle table of contents, and inspect the real-time document view.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded bg-gray-50/70 dark:bg-gray-900/40">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-500">
              STEP 03
            </div>
            <h3 className="text-base font-semibold font-serif">
              Export your PDF
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Click Export PDF or press Ctrl+Enter. Pandoc & Typst compile the document into a high-resolution vector PDF ready to share.
            </p>
          </div>
        </div>
      </section>

      {/* Preset Showcase / Samples Section */}
      <section id="samples" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full bg-[#f4f2ec] dark:bg-[#0f1114] rounded-2xl mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-2">
              Explore Sample Documents
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Jump straight into pre-configured documents featuring complex equations and tables.
            </p>
          </div>

          <button
            onClick={onStartWriting}
            className="mt-4 sm:mt-0 flex items-center space-x-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline"
          >
            <span>Open Blank Document</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onLoadSample(sample.id)}
              className="p-6 rounded-lg bg-white dark:bg-[#15171a] hover:bg-amber-50/20 dark:hover:bg-amber-950/10 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {sample.preset}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>

              <h3 className="text-base font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">
                {sample.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 sm:px-12 text-xs text-gray-500 dark:text-gray-400 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-amber-700 dark:bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-xs">
            P
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">Paperflow</span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span>From Markdown to beautifully typeset documents.</span>
        </div>

        <div className="flex items-center space-x-6 text-[11px]">
          <span>Privacy Focused (Local Browser Storage)</span>
          <span>Pandoc & Typst Engine</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};
