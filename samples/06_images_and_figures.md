# Architectural Figures & Visual Documentation

Author: Systems Architecture Team
Preset: Technical Documentation

## 1. System Overview

Paperflow separates client editing, live DOM rendering, and native PDF vector compilation:

![Architecture Diagram](sample_diagram.png)

### 2. Design Characteristics

The compilation pipeline operates within isolated sandbox boundaries:

1. **Client Tier**: CodeMirror 6 with live KaTeX mathematics evaluation.
2. **Persistence Tier**: IndexedDB storage for offline persistence.
3. **Typesetting Pipeline**: Ephemeral Pandoc parsing with Typst vector generation.

The energy relation $E = mc^2$ applies to all physical processing units.
