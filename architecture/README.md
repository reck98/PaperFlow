# PaperFlow — Technical Architecture & System Documentation

> Comprehensive architecture analysis, end-to-end data pipelines, physical schema specifications, and security model reverse-engineered from source.

---

## 1. Executive Architecture Overview

**PaperFlow** is a modern, privacy-preserving desktop and web typesetting application designed to convert Markdown enriched with complex mathematical equations, tables, and images into publication-grade vector PDF documents.

Unlike traditional cloud-based typesetting systems (such as Overleaf or HackMD) that mandate remote user accounts, continuous cloud synchronization, and heavy server-side LaTeX distributions (like TeX Live, which often requires >5GB container images), PaperFlow implements a **Local-First, Zero-Retention, Dual-Engine Architecture**:

1. **Client Tier (Local-First React SPA)**:
   - Built on **React 18**, **Vite**, and **Tailwind CSS**.
   - Embeds a full **CodeMirror 6** markdown editor with custom syntax extensions and dark/light themes.
   - Employs a sub-16ms interactive client-side preview engine combining **Marked** with **KaTeX** and custom LaTeX math normalizers.
   - Preserves all documents and user settings entirely inside browser **IndexedDB** (`paperflow_db`) and `localStorage`.

2. **Backend Tier (Stateless Vector Engine)**:
   - Lightweight **Node.js 22** + **Express 4** server.
   - Completely stateless: zero server-side databases, zero user tokens, zero persistent disk files.
   - Pairs **Pandoc CLI v3.6.3** (utilizing its native Typst AST writer) with the modern **Typst CLI v0.13.0** vector compiler.
   - Processes export requests in ephemeral, cryptographically isolated scratch directories in `os.tmpdir()` that are guaranteed to be recursively purged via `try...finally` execution blocks.

---

## 2. Technology Stack & Component Inventory

| Layer | Technology | Version | Purpose in Codebase |
|---|---|---|---|
| **Frontend Framework** | React | `18.3.1` | Reactive view hierarchy and single-source-of-truth document state (`EditorPage.tsx`) |
| **Bundler & Dev Server** | Vite | `6.2.0` | Sub-millisecond HMR and optimized production static asset bundle generation |
| **Code Editor** | CodeMirror | `6.x` (`@codemirror/view`, `@codemirror/state`, `@codemirror/lang-markdown`) | Full-featured text editor with syntax highlighting, history, and keyboard shortcuts |
| **Math DOM Engine** | KaTeX | `0.16.21` | Client-side fast mathematical formula rendering for interactive preview |
| **Markdown Parser** | Marked | `15.0.7` | Tokenizer and HTML generator with custom heading auto-ID and code block formatting |
| **Client Storage** | IndexedDB API | Native (v1) | Persistent client-side document database (`services/db.ts` in `paperflow_db`) |
| **Styling** | Tailwind CSS | `3.4.17` | Utility-first responsive design supporting full dark/light modes and mobile viewports |
| **Backend Runtime** | Node.js | `22.x` | Asynchronous I/O execution environment for HTTP API and child process orchestration |
| **Server Framework** | Express | `4.21.2` | REST API routing (`/api/pdf`, `/api/typst`, `/api/health`, `/api/presets`) |
| **AST Converter** | Pandoc CLI | `3.6.3` | Converts Markdown with TeX math extensions directly into intermediate Typst markup (`body.typ`) |
| **Typesetting Core** | Typst CLI | `0.13.0` | Compiles Typst markup and custom typography templates into high-performance vector PDFs |
| **Reverse Proxy** | Nginx | Stable | Front-facing reverse proxy with Gzip compression and 25MB client payload buffer |
| **Containerization** | Docker | Bookworm-slim | 3-stage multi-platform build producing a hardened runtime with embedded fonts |
| **Cloud Deployment** | Render.com | PaaS | Cloud Web Service configuration defined in `render.yaml` with automated health checks |

---

## 3. Visual Architecture Suite

All 9 diagrams below were generated using the **Archify skill**, validated against strict showcase schemas, verified with headless Chromium browser checks, and exported as standalone interactive HTML files and high-resolution PNGs.

You can explore the interactive suite live at **[paperflow.reck98.in/architecture](https://paperflow.reck98.in/architecture/)**.

### [1. Complete System Architecture](https://paperflow.reck98.in/architecture/system-architecture.html)
* **Interactive HTML**: [paperflow.reck98.in/architecture/system-architecture.html](https://paperflow.reck98.in/architecture/system-architecture.html)
* **High-Res Export**: [`diagrams/system-architecture.png`](diagrams/system-architecture.png) ([Direct Link](https://paperflow.reck98.in/architecture/diagrams/system-architecture.png))
* **Diagram Type**: `architecture`
* **Description**: Complete ecosystem map illustrating external users, the local-first client browser sandbox, Nginx reverse proxy, Express application server, ephemeral filesystem scratchpads, and containerized Pandoc/Typst compilation core.

### [2. End-to-End Request Journey](https://paperflow.reck98.in/architecture/request-journey.html)
* **Interactive HTML**: [paperflow.reck98.in/architecture/request-journey.html](https://paperflow.reck98.in/architecture/request-journey.html)
* **High-Res Export**: [`diagrams/request-journey.png`](diagrams/request-journey.png) ([Direct Link](https://paperflow.reck98.in/architecture/diagrams/request-journey.png))
* **Diagram Type**: `sequence`
* **Description**: Detailed sequence trace of a user export request: triggering the modal, HTTP payload transport, ephemeral UUID workspace generation, Pandoc AST compilation, Typst formatting template injection, vector PDF binary compilation, and client-side object URL download.

### [3. Frontend Architecture](https://paperflow.reck98.in/architecture/frontend-architecture.html)
* **Interactive HTML**: [paperflow.reck98.in/architecture/frontend-architecture.html](https://paperflow.reck98.in/architecture/frontend-architecture.html)
* **High-Res Export**: [`diagrams/frontend-architecture.png`](diagrams/frontend-architecture.png) ([Direct Link](https://paperflow.reck98.in/architecture/diagrams/frontend-architecture.png))
* **Diagram Type**: `architecture`
* **Description**: Component hierarchy and data flow within the React 18 single-page application: `App.tsx` routing, `EditorPage.tsx` state orchestrator, CodeMirror 6 markdown editor, LivePreview KaTeX DOM renderer, modal components, and the `services/db.ts` IndexedDB persistence adapter.

### [4. Backend Architecture](https://paperflow.reck98.in/architecture/backend-architecture.html)
* **Interactive HTML**: [paperflow.reck98.in/architecture/backend-architecture.html](https://paperflow.reck98.in/architecture/backend-architecture.html)
* **High-Res Export**: [`diagrams/backend-architecture.png`](diagrams/backend-architecture.png) ([Direct Link](https://paperflow.reck98.in/architecture/diagrams/backend-architecture.png))
* **Diagram Type**: `architecture`
* **Description**: Node.js/Express server architecture: `server.ts` initialization, `cors()` and body parser middlewares, static production SPA serving, `exportRouter` endpoints, `utils/paths.ts` binary discovery logic, `pdfService.ts` conversion service, and error handler.

### [5. Database ERD & Data Schema](https://paperflow.reck98.in/architecture/database-erd.html)
* **Interactive HTML**: [paperflow.reck98.in/architecture/database-erd.html](https://paperflow.reck98.in/architecture/database-erd.html)
* **High-Res Export**: [`diagrams/database-erd.png`](diagrams/database-erd.png) ([Direct Link](https://paperflow.reck98.in/architecture/diagrams/database-erd.png))
* **Diagram Type**: `erd`
* **Description**: Physical schema of the browser's IndexedDB (`paperflow_db`, store: `documents`), `localStorage` preference keys, HTTP wire transfer DTOs (`ExportPdfRequest`), image attachment structures, and ephemeral filesystem entities.

### [6. Authentication, Session & Security Model](https://paperflow.reck98.in/architecture/authentication-flow.html)
* **Interactive HTML**: [paperflow.reck98.in/architecture/authentication-flow.html](https://paperflow.reck98.in/architecture/authentication-flow.html)
* **High-Res Export**: [`diagrams/authentication-flow.png`](diagrams/authentication-flow.png) ([Direct Link](https://paperflow.reck98.in/architecture/diagrams/authentication-flow.png))
* **Diagram Type**: `lifecycle`
* **Description**: Lifecycle model of PaperFlow's zero-knowledge security architecture: anonymous client sessions, strict 5MB payload validation gates, unprivileged Docker container user (`paperflow`), and deterministic zero-retention filesystem purges.

### [7. Deployment & Infrastructure Architecture](https://paperflow.reck98.in/architecture/deployment-architecture.html)
* **Interactive HTML**: [paperflow.reck98.in/architecture/deployment-architecture.html](https://paperflow.reck98.in/architecture/deployment-architecture.html)
* **High-Res Export**: [`diagrams/deployment-architecture.png`](diagrams/deployment-architecture.png) ([Direct Link](https://paperflow.reck98.in/architecture/diagrams/deployment-architecture.png))
* **Diagram Type**: `architecture`
* **Description**: Infrastructure topology covering local development environments, the 3-stage multi-platform `Dockerfile`, Docker Compose service definitions (2.0 CPUs, 2GB memory ceiling), Nginx reverse proxy configuration, and Render.com cloud specs.

### [8. Data Flow Architecture](https://paperflow.reck98.in/architecture/data-flow.html)
* **Interactive HTML**: [paperflow.reck98.in/architecture/data-flow.html](https://paperflow.reck98.in/architecture/data-flow.html)
* **High-Res Export**: [`diagrams/data-flow.png`](diagrams/data-flow.png) ([Direct Link](https://paperflow.reck98.in/architecture/diagrams/data-flow.png))
* **Diagram Type**: `dataflow`
* **Description**: Dual-path data pipeline tracking user markdown input through client-side KaTeX rendering for interactive authoring, and through Pandoc AST parsing, Typst template injection, and vector compilation for publication output.

### [9. Critical Business Workflow](https://paperflow.reck98.in/architecture/business-workflow.html)
* **Interactive HTML**: [paperflow.reck98.in/architecture/business-workflow.html](https://paperflow.reck98.in/architecture/business-workflow.html)
* **High-Res Export**: [`diagrams/business-workflow.png`](diagrams/business-workflow.png) ([Direct Link](https://paperflow.reck98.in/architecture/diagrams/business-workflow.png))
* **Diagram Type**: `workflow`
* **Description**: Detailed execution workflow of the core Markdown-to-PDF conversion pipeline: code block shielding, TeX delimiter and matrix normalization, Pandoc CLI execution, Typst template merging, vector PDF emission, and guaranteed cleanup.

---

## 4. Key Architectural Decisions & Engineering Trade-Offs

### 1. Typst Over Traditional LaTeX (pdfLaTeX / XeLaTeX)
- **Decision**: PaperFlow compiles to vector PDF via **Typst** rather than LaTeX.
- **Rationale**:
  - Compilation speed: Typst compiles typical multi-page papers in **80ms to 250ms**, whereas LaTeX often requires 2.5s to 8s per compilation pass.
  - Container footprint: Typst is a standalone static binary (~30MB), whereas TeX Live requires 4GB to 7GB of packages.
  - Native typst writer in modern Pandoc (v3.1.2+) allows standard Markdown to be directly transpiled to Typst syntax without loss of mathematical precision.

### 2. Local-First Client Storage (IndexedDB)
- **Decision**: All document authoring, revision tracking, and active state management live strictly inside the client's browser IndexedDB (`paperflow_db`).
- **Rationale**:
  - Total user privacy: User research papers, corporate documents, and private notes never touch a server database.
  - Zero latency: Autosave operations are local and instantaneous (debounced at 1.5s).
  - Offline resilience: The editor works completely offline without network connectivity.

### 3. Ephemeral Stateless Backend
- **Decision**: The backend maintains no persistent databases or user sessions.
- **Rationale**:
  - Scalability: The backend functions as an embarrassingly parallel compute worker that can scale horizontally across multiple container instances without state coordination.
  - Zero attack surface: No sensitive customer data is stored on disk that could be leaked or stolen in a breach.
  - Resource safety: Ephemeral directories (`os.tmpdir()/paperflow-<uuid>`) are deleted immediately in `finally` blocks.

### 4. Code Block Shielding Before Math Preprocessing
- **Decision**: In both frontend (`markdownRenderer.ts`) and backend (`pdfService.ts`), all fenced (```` ``` ```` and `~~~`) and inline (`` ` ``) code snippets are replaced with unique non-colliding placeholders before LaTeX normalization runs.
- **Rationale**:
  - Prevents programming code symbols (such as `$`, `&`, `_`, `\\`) inside shell scripts, Python, or C++ blocks from being erroneously converted into math delimiters or escaped syntax.

---

## 5. Security & Isolation Model

1. **Unprivileged Container Execution**:
   - The production Docker image creates a dedicated unprivileged user `paperflow` (`UID/GID 1000`) and executes Node.js under this user.
   - Root privileges are completely revoked before network ports are bound.

2. **Payload & Input Bounds**:
   - Incoming JSON request bodies are capped at **25MB** (`express.json({ limit: '25mb' })`), accommodating embedded high-resolution figures.
   - Raw Markdown content is explicitly capped at **5MB**, preventing memory exhaustion from maliciously crafted payloads.
   - Strict string validation rejects malformed non-string inputs with HTTP 400 before passing arguments to child processes.

3. **Subprocess Isolation**:
   - Child processes are executed via Node's `execFileAsync` rather than `exec`, preventing command-injection attacks by passing argument arrays directly to the OS kernel without shell expansion (`sh` / `cmd.exe`).
   - CLI execution timeouts are strictly enforced: **15 seconds** for Pandoc AST parsing and **20 seconds** for Typst compilation.

4. **Error Sanitization**:
   - Path masking in `pdfService.ts` removes internal server filesystem paths (`/tmp/paperflow-...` or `C:\Users\...`) from error messages before sending them to the client.

---

## 6. Known Limitations & Architectural Gaps

1. **Large Document Memory Bounds**:
   - Compiling documents with hundreds of high-resolution embedded base64 images within a single request can push the Docker container toward its 2048MB memory limit.
   - *Recommendation*: Introduce an asynchronous job queue (e.g., BullMQ with Redis) for large-scale batch processing when handling books or monographs exceeding 200 pages.

2. **Font Coverage**:
   - While the Docker image bundles core open-source fonts (`fonts-dejavu`, `fonts-lmodern`, `fonts-linuxlibertine`, `fonts-inter`, `fonts-roboto`, `fonts-firacode`, `fonts-noto-core`), custom proprietary fonts (such as Times New Roman or Helvetica) fall back to metric-compatible Linux alternatives.
   - *Recommendation*: Expose a custom font upload endpoint or volume mount path for enterprise typography standards.

3. **Browser Cross-Device Synchronization**:
   - Because document state is stored in browser IndexedDB, documents do not automatically sync across different devices or browsers.
   - *Recommendation*: Implement an optional peer-to-peer WebRTC or encrypted cloud sync protocol (e.g., CRDT via Yjs) for multi-device workflows without compromising zero-knowledge privacy.

---

## 7. How to Navigate and View the Deliverables

- **Live Landing Page**: Visit **[paperflow.reck98.in/architecture](https://paperflow.reck98.in/architecture/)** (or open [`index.html`](index.html)) for the unified interactive visual portal.
- **Interactive Diagrams**: Click any of the HTML links in Section 3 to explore interactive diagrams with zoom, pan, theme toggling (dark/light), and motion replay.
- **Static Graphics**: Access the [`diagrams/`](diagrams/) directory or use the direct PNG links for high-resolution graphics suitable for architecture reviews, presentations, or offline documentation.
