# Paperflow

> **From Markdown to beautifully typeset documents.**

Paperflow is a modern, high-performance web application designed to convert Markdown documents into publication-quality vector PDFs, with first-class native mathematical typesetting via LaTeX formulas.

Whether writing lecture notes in theoretical physics, drafting software engineering architecture proposals, or compiling research papers, Paperflow bridges the gap between lightweight Markdown and publication-grade PDF output.

---

## Architecture & PDF Engine Decision

### 1. The PDF Engine: Why Typst + Pandoc

Paperflow evaluates both **Pandoc + XeLaTeX** and **Pandoc + Typst**:

| Metric | Pandoc + XeLaTeX | Pandoc + Typst (Paperflow Choice) |
| :--- | :--- | :--- |
| **Compilation Speed** | 3.5 – 12.0 seconds | **150 – 350 milliseconds** (15–30× faster) |
| **Mathematical Rendering** | Native Computer Modern / TeX math | **Native vector math** (fractions, matrices, summations, integrals) |
| **Footprint & Installation** | ~4.5 GB TeX Live distribution | **~40 MB self-contained binary** |
| **Security Surface** | Vulnerable to shell-escape and TeX macro attacks | **Memory-safe (Rust), no arbitrary execution** |
| **Output Quality** | Selectable vector PDF with embedded fonts | **Selectable vector PDF with embedded fonts** |

**Decision**: Paperflow adopts **Pandoc + Typst** as its primary PDF compilation engine. Pandoc translates standard Markdown and LaTeX math environments (`$ ... $`, `$$ ... $$`, `\begin{aligned}`, `\begin{pmatrix}`, etc.) directly into native Typst markup. Typst then compiles the typeset document in milliseconds. In production Docker environments, XeLaTeX and full TeX fonts are also installed for complete hybrid compatibility.

---

## Features

* **Sub-Millisecond Live Preview**: Instant client-side KaTeX rendering updates as you type.
* **Pure Vector Mathematics**: Equations remain razor-sharp at any zoom level, print resolution, or screen density.
* **Four Curated Document Presets**:
  1. **Academic Notes**: Serif typography (`Source Serif 4`, `Libertinus`), numbered display equations, formal margins, and clean booktabs-style horizontal rules.
  2. **Technical Documentation**: Modern sans-serif typography (`Inter`), structured hierarchical section numbering (`1.1`, `1.2`), syntax-highlighted code blocks with subtle borders, and running header bars.
  3. **Minimal**: Austere editorial aesthetic, generous whitespace, unnumbered quiet headings, and distraction-free margins.
  4. **Research Paper**: Publication format with abstract block, numbered sections and equations, and multi-column scientific layout.
* **Full Markdown & Math Support**:
  - Inline: `$E = mc^2$`
  - Display: `$$\int_0^T x(t)y(t)\,dt = 0$$`
  - Matrices: `$$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$$`
  - Aligned systems of equations: `$$\begin{aligned} ... \end{aligned}$$`
  - Piecewise cases: `$$\begin{cases} ... \end{cases}$$`
  - GFM Tables, Blockquotes, Syntax-highlighted code blocks, Images
* **Drag-and-Drop & Multi-format Upload**: Drop `.md`, `.markdown`, or `.txt` files directly onto the editor or upload modal.
* **Client-Side Persistence & Privacy**: Documents are stored locally in the browser's IndexedDB. PDF compilation runs ephemerally in isolated temporary directories and is immediately cleaned up. No user data is stored on external cloud databases.
* **Document Outline Navigation**: Automatically parses H1–H6 headings into a navigable outline tree.

---

## Repository Structure

```
PaperFlow/
├── backend/                  # Node.js + Express + TypeScript PDF conversion service
│   ├── src/
│   │   ├── converters/       # Pandoc + Typst conversion pipelines & PDF generation
│   │   ├── presets/          # Typst presets (Academic, Technical, Minimal, Research)
│   │   ├── routes/           # REST endpoints (/api/export/pdf, /api/health, etc.)
│   │   ├── utils/            # Binary resolver & temp directory isolation
│   │   └── server.ts         # Unified Express server (serves API & frontend dist)
│   └── package.json
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Header, Sidebar, ExportModal, UploadModal, SettingsModal
│   │   ├── editor/           # CodeMirror 6 editor wrapper
│   │   ├── preview/          # KaTeX + Marked live document renderer
│   │   ├── pages/            # LandingPage (Taste skill editorial), EditorPage
│   │   ├── services/         # IndexedDB persistence & API client
│   │   └── samples/          # Preloaded rich sample documents with math
│   └── package.json
├── bin/                      # Portable standalone binaries for Windows (pandoc.exe, typst.exe)
├── docker/                   # Production multi-stage Dockerfile & docker-compose.yml
├── samples/                  # Markdown test suite documents and sample PDFs
└── package.json              # Root workspace orchestrator
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v22 recommended)
- **pnpm**: v9.0.0 or higher
- **Pandoc** and **Typst**: Pre-downloaded in `bin/` for Windows or installed via system package manager on Linux / macOS (`brew install pandoc typst` or `apt install pandoc`).

### 1. Install Dependencies

```bash
# In backend
cd backend
pnpm install

# In frontend
cd ../frontend
pnpm install
```

### 2. Run in Development Mode

```bash
# Terminal 1: Backend service (port 3001)
cd backend
pnpm run dev

# Terminal 2: Frontend Vite dev server (port 5173)
cd frontend
pnpm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Production Build

```bash
# Build both backend and frontend
pnpm run build

# Start production server
pnpm start
```

---

## Docker Deployment

Paperflow provides a multi-stage production Docker image that packages Pandoc, Typst, XeLaTeX, TeX fonts, and the Node.js application in an unprivileged, secure container.

```bash
cd docker
docker compose up -d --build
```

The application will be accessible on `http://localhost:3000`.

---

## API Reference

### 1. `POST /api/export/pdf`
Compiles a Markdown document into a vector PDF.

**Request Payload (`application/json`):**
```json
{
  "markdown": "# Quantum Electrodynamics\n\nInline: $E = m c^2$\n\n$$\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}$$",
  "metadata": {
    "title": "Quantum Electrodynamics",
    "author": "Dr. Julian Schwinger",
    "date": "November 2026",
    "abstract": "An inquiry into field quantization..."
  },
  "settings": {
    "preset": "academic",
    "pageSize": "a4",
    "orientation": "portrait",
    "margins": "normal",
    "fontSize": "11pt",
    "lineSpacing": 1.4,
    "numberedHeadings": true,
    "includeToc": false
  }
}
```

**Response:**
Binary stream with headers:
- `Content-Type: application/pdf`
- `Content-Disposition: inline; filename="Quantum_Electrodynamics.pdf"`

### 2. `GET /api/presets`
Lists all available document presets and default typography configurations.

### 3. `GET /api/health`
Health check endpoint reporting conversion engine binary availability.

---

## Security & Reliability Controls

1. **Path Traversal Protection**: All user filenames and image inputs are sanitized using strict alphanumeric whitelisting and path normalization.
2. **Process Sandboxing**: Conversion executes strictly inside unique UUID-isolated temporary directories within the operating system's temp location.
3. **Guaranteed Cleanup**: Temporary directories and assets are deleted immediately upon completion or failure using `try ... finally` blocks.
4. **Execution Timeouts**: Child processes have a hard 15–20 second timeout to prevent resource starvation from malicious or recursive inputs.
5. **No Shell Invocations**: Commands are invoked directly via `execFile` without shell interpolation (`cmd.exe` or `/bin/sh`).

---

## License

MIT License. Crafted with precision for authors, engineers, and researchers.
