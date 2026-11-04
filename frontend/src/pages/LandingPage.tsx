import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Moon,
  Sun,
  ChevronRight,
  Github,
  Network
} from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../samples';

interface LandingPageProps {
  onStartWriting: () => void;
  onOpenBlankDocument?: () => void;
  onLoadSample: (sampleId: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartWriting,
  onOpenBlankDocument = onStartWriting,
  onLoadSample,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-[100dvh] bg-[#faf9f6] text-[#141716] dark:bg-[#0c0e0f] dark:text-[#ededed] flex flex-col font-sans transition-colors overflow-x-hidden">
      {/* Navigation */}
      <nav className="h-14 sm:h-16 px-4 sm:px-8 md:px-12 flex items-center justify-between select-none max-w-7xl w-full mx-auto">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-700 dark:bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-sm sm:text-base">
            P
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-tight font-serif">Paperflow</span>
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

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onStartWriting}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded text-xs sm:text-sm font-medium transition-colors active:scale-95 min-h-[38px]"
          >
            <span>Start Writing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-10 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-gray-950 dark:text-gray-50 leading-[1.14] mb-4 sm:mb-6">
            Your Markdown deserves a better PDF.
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 font-normal leading-relaxed mb-6 sm:mb-8 max-w-2xl">
            Write, preview, and transform Markdown into beautifully typeset documents.
            Mathematical equations, technical notes, and academic papers directly in your browser.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={onStartWriting}
              className="flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded font-medium text-xs sm:text-sm transition-colors active:scale-95 min-h-[42px]"
            >
              <span>Start Writing Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#features"
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-200/50 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors min-h-[42px] flex items-center"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Visual Product Preview: Live Interface Fragment marked data-ui */}
        <div data-ui="true" className="mt-6 sm:mt-8 rounded-lg border border-[#e2dfd7] dark:border-[#262a2f] bg-white dark:bg-[#131518] overflow-hidden shadow-sm">
          {/* Mock App Header */}
          <div className="h-10 px-3 sm:px-4 border-b border-gray-200 dark:border-gray-800 bg-[#f7f5ef] dark:bg-[#181b1e] flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2 truncate pr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block flex-none" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block flex-none" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block flex-none" />
              <span className="ml-2 sm:ml-3 text-[11px] text-gray-700 dark:text-gray-300 truncate">
                theoretical_physics.md (Academic Preset)
              </span>
            </div>

            <div className="flex items-center space-x-2 flex-none">
              <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
                Vector Math Ready
              </span>
            </div>
          </div>

          {/* Interactive Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[380px] sm:min-h-[460px]">
            {/* Left: Raw Markdown Editor with Math */}
            <div className="p-4 sm:p-6 text-xs leading-relaxed bg-[#fbfbfa] dark:bg-[#0f1113] overflow-x-auto text-gray-800 dark:text-gray-300 select-none border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
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
            <div className="p-4 sm:p-8 bg-white dark:bg-[#15171a] font-serif overflow-x-auto select-none">
              <div className="text-gray-400 pb-2 mb-4 text-[10px] font-sans uppercase font-bold tracking-wider flex justify-between items-center">
                <span>Typeset Output Preview</span>
                <span className="text-amber-700 dark:text-amber-400 lowercase">page 1 of 4</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-950 dark:text-gray-50 tracking-tight break-words">
                Special Relativity and Wave Equations
              </h2>
              <div className="text-xs font-sans text-gray-500 mt-1 mb-4 italic">
                Dr. Julian S. Schwinger, Department of Physics
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-sans mb-3 break-words">
                The spacetime interval in four-dimensional Minkowski geometry is strictly invariant under Lorentz transformations:
              </p>

              <div className="my-3 py-2 text-center text-sm font-serif bg-gray-50/60 dark:bg-gray-800/30 rounded overflow-x-auto">
                <span className="font-serif italic text-base">ds</span>² = η<sub>μν</sub> <span className="font-serif italic">dx</span><sup>μ</sup> <span className="font-serif italic">dx</span><sup>ν</sup>
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-sans mb-3 break-words">
                In the rest frame where relativistic momentum vanishes, this reduces to:
              </p>

              <div className="my-3 py-2 text-center font-serif text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200 bg-amber-50/40 dark:bg-amber-950/20 rounded overflow-x-auto">
                <span className="italic">E</span> = <span className="italic">m</span>₀ <span className="italic">c</span>²
              </div>

              <div className="mt-4 pt-3 flex flex-wrap justify-between items-center text-[10px] sm:text-[11px] font-sans text-gray-400 gap-1">
                <span>Typeset with Pandoc & Typst</span>
                <span>Sharp 1200 DPI Vector PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-14 sm:py-24 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto w-full bg-[#f4f2ec] dark:bg-[#0f1114] rounded-xl sm:rounded-2xl my-6 sm:my-8">
        <div className="max-w-2xl mb-10 sm:mb-14">
          <h2 className="text-xl sm:text-3xl font-serif font-bold tracking-tight mb-2 sm:mb-3">
            Designed for technical rigor and editorial clarity.
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Every feature in Paperflow exists to make document creation focused, beautiful, and precise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-xs">
          <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#15171a] space-y-2.5 sm:space-y-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs sm:text-sm">
              1
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Beautiful PDF Exports
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              No low-res browser screenshot hacks. Real, vector-typeset documents with crisp fonts, proper page breaks, and selectable text.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#15171a] space-y-2.5 sm:space-y-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs sm:text-sm">
              2
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Native Mathematical Typesetting
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              First-class support for inline ($E=mc^2$) and display equations, matrices, integrals, summations, and aligned structures.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#15171a] space-y-2.5 sm:space-y-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs sm:text-sm">
              3
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Instant Live Preview
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Sub-millisecond KaTeX preview updates as you type. Real-time document sheet view with outline navigation.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#15171a] space-y-2.5 sm:space-y-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs sm:text-sm">
              4
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Upload or Paste Directly
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Drop `.md`, `.markdown`, or `.txt` files directly onto the editor. Imports markdown without mangling equations.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#15171a] space-y-2.5 sm:space-y-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs sm:text-sm">
              5
            </div>
            <h3 className="text-sm font-semibold font-serif text-gray-900 dark:text-gray-100">
              Four Professional Presets
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Switch between Academic Notes, Technical Documentation, Minimal Editorial, and Two-Column Research Paper presets.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#15171a] space-y-2.5 sm:space-y-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs sm:text-sm">
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
      <section id="how-it-works" className="py-14 sm:py-24 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
        <div className="max-w-xl mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-serif font-bold tracking-tight mb-2 sm:mb-3">
            How it works
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Three simple steps to publish your thoughts into publication-grade documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-2.5 sm:space-y-3 p-5 sm:p-6 rounded-lg bg-gray-50/70 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-500">
              STEP 01
            </div>
            <h3 className="text-sm sm:text-base font-semibold font-serif">
              Write or upload Markdown
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Type directly in the distraction-free CodeMirror editor or drag and drop your existing notes. Include LaTeX math freely.
            </p>
          </div>

          <div className="space-y-2.5 sm:space-y-3 p-5 sm:p-6 rounded-lg bg-gray-50/70 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-500">
              STEP 02
            </div>
            <h3 className="text-sm sm:text-base font-semibold font-serif">
              Customize and preview
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Choose an aesthetic preset, adjust margins, toggle table of contents, and inspect the real-time document view.
            </p>
          </div>

          <div className="space-y-2.5 sm:space-y-3 p-5 sm:p-6 rounded-lg bg-gray-50/70 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-500">
              STEP 03
            </div>
            <h3 className="text-sm sm:text-base font-semibold font-serif">
              Export your PDF
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Click Export PDF or press Ctrl+Enter. Pandoc & Typst compile the document into a high-resolution vector PDF ready to share.
            </p>
          </div>
        </div>
      </section>

      {/* Preset Showcase / Samples Section */}
      <section id="samples" className="py-14 sm:py-24 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto w-full bg-[#f4f2ec] dark:bg-[#0f1114] rounded-xl sm:rounded-2xl mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-2">
          <div>
            <h2 className="text-xl sm:text-3xl font-serif font-bold tracking-tight mb-1 sm:mb-2">
              Explore Sample Documents
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Jump straight into pre-configured documents featuring complex equations and tables.
            </p>
          </div>

          <button
            onClick={onOpenBlankDocument}
            className="flex items-center space-x-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer min-h-[36px]"
          >
            <span>Open Blank Document</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onLoadSample(sample.id)}
              className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#15171a] hover:bg-amber-50/20 dark:hover:bg-amber-950/10 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {sample.preset}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>

              <h3 className="text-sm sm:text-base font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">
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
      <footer className="mt-auto py-8 sm:py-12 px-4 sm:px-8 md:px-12 text-xs text-gray-500 dark:text-gray-400 max-w-7xl mx-auto w-full border-t border-gray-200/60 dark:border-gray-800/60 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-6 h-6 rounded bg-amber-700 dark:bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-xs flex-none">
              P
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">Paperflow</span>
            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">•</span>
            <span className="hidden sm:inline">From Markdown to beautifully typeset documents.</span>
          </div>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
          <span>
            Made with ❤️ by{' '}
            <a
              href="https://github.com/reck98"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 underline underline-offset-2 transition-colors"
            >
              reck98
            </a>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto justify-center">
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500 mr-2 select-none">
            <span>Privacy Focused (IndexedDB)</span>
            <span>•</span>
            <span>Pandoc & Typst Engine</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <a
              href="/architecture"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium border border-gray-300/80 dark:border-white/20 bg-white/90 dark:bg-black/90 text-gray-800 dark:text-gray-100 hover:text-amber-800 dark:hover:text-amber-400 hover:border-amber-600/50 dark:hover:border-amber-500/50 hover:bg-amber-50/20 dark:hover:bg-zinc-900 shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98] min-h-[38px] sm:min-h-[40px]"
            >
              <Network className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
              <span>System Architecture</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0" />
            </a>

            <a
              href="https://github.com/reck98/PaperFlow"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="group inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium border border-gray-300/80 dark:border-white/20 bg-white/90 dark:bg-black/90 text-gray-800 dark:text-gray-100 hover:text-gray-950 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/40 hover:bg-gray-50/60 dark:hover:bg-zinc-900 shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98] min-h-[38px] sm:min-h-[40px]"
            >
              <Github className="w-3.5 h-3.5 text-gray-700 dark:text-gray-200 group-hover:text-gray-950 dark:group-hover:text-white flex-shrink-0" />
              <span>GitHub Repository</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
