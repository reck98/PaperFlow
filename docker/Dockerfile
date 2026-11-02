# ==============================================================================
# Paperflow Production Dockerfile
# Multi-stage build with full Pandoc, Typst, and XeLaTeX typesetting support
# ==============================================================================

# --- Stage 1: Build Frontend ---
FROM node:22-slim AS frontend-builder
WORKDIR /app/frontend

RUN npm install -g pnpm

COPY frontend/package.json frontend/pnpm-lock.yaml* ./
RUN pnpm install

COPY frontend/ ./
RUN pnpm run build

# --- Stage 2: Build Backend ---
FROM node:22-slim AS backend-builder
WORKDIR /app/backend

RUN npm install -g pnpm

COPY backend/package.json backend/pnpm-lock.yaml* ./
RUN pnpm install

COPY backend/ ./
RUN pnpm run build

# --- Stage 3: Production Runtime with Typesetting Engines ---
FROM debian:bookworm-slim AS production

ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production \
    PORT=3000

# 1. Install Node.js 22, Pandoc, XeLaTeX, Fonts, and curl/ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    pandoc \
    texlive-xetex \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    fonts-dejavu \
    fonts-lmodern \
    fonts-libertine \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Typst CLI standalone binary (v0.13.0)
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
      TYPST_URL="https://github.com/typst/typst/releases/download/v0.13.0/typst-x86_64-unknown-linux-musl.tar.xz"; \
    elif [ "$ARCH" = "aarch64" ]; then \
      TYPST_URL="https://github.com/typst/typst/releases/download/v0.13.0/typst-aarch64-unknown-linux-musl.tar.xz"; \
    fi && \
    curl -fsSL "$TYPST_URL" -o /tmp/typst.tar.xz && \
    tar -xf /tmp/typst.tar.xz -C /tmp && \
    cp /tmp/typst-*/typst /usr/local/bin/typst && \
    chmod +x /usr/local/bin/typst && \
    rm -rf /tmp/typst*

# 3. Create unprivileged app user
RUN useradd -m -s /bin/bash paperflow

WORKDIR /app

# 4. Copy backend production dependencies & built artifacts
COPY --chown=paperflow:paperflow backend/package.json ./backend/
RUN cd backend && npm install --omit=dev

COPY --from=backend-builder --chown=paperflow:paperflow /app/backend/dist ./backend/dist
COPY --from=frontend-builder --chown=paperflow:paperflow /app/frontend/dist ./frontend/dist

# 5. Verify installed typesetting engines
RUN pandoc --version && \
    typst --version && \
    xelatex --version && \
    node --version

USER paperflow

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "backend/dist/server.js"]
