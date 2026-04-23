# 🚗 Vozila.hr - Enterprise Monorepo

Premium Croatian vehicle marketplace built with React, TypeScript, and Express.

## 📁 Project Structure

```
vozila-hr/
├── client/              # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── index.css   # Tailwind + Dark Mode variables
│   │   └── main.tsx    # Entry point
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── server/              # Express + TypeScript backend
│   ├── src/
│   │   └── index.ts    # Express server (port 8080)
│   ├── tsconfig.json
│   └── package.json
└── package.json         # Root monorepo orchestration
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Run Development Servers

```bash
npm run dev
```

This will start:
- **Client**: http://localhost:5173
- **Server**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

### 3. Build for Production

```bash
npm run build
```

## 🎨 Design System

### Dark Mode Variables
All colors use semantic HSL variables defined in `client/src/index.css`:
- `--background`, `--foreground`
- `--primary`, `--secondary`
- `--card`, `--border`, `--accent`

### Transitions
Premium cubic-bezier timing: `ease-premium` = `cubic-bezier(0.25, 1, 0.5, 1)`

### Spacing Scale
Mathematical progression: 4, 8, 16, 24, 32, 48, 64

## 🏗️ Architecture Rules

See `SYSTEM_ARCHITECTURE.md` for complete guidelines:
- English-only database schemas and API keys
- Croatian (`hr-HR`) UI layer only
- Dynamic routing with URL parameters
- Zod validation on all inputs
- Semantic Tailwind variables (no hardcoded colors)

## 📦 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 3
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Validation**: Zod
