# AI-Based Network Frontend

A React TypeScript application featuring a ReactFlow canvas and an integrated chatbot UI built with Material-UI (MUI).

## Tech Stack

- **React 19.2** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Material-UI (MUI)** - UI component library
- **ReactFlow** - Node-based graph visualization
- **Axios** - HTTP client for API calls
- **Emotion** - CSS-in-JS styling library

## Setup Instructions

### Prerequisites

- Node.js 20.17+ (or 22.12+)
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```bash
copy .env.example .env
```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port shown in terminal).

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## API Integration

The frontend connects to the Flask backend at `http://localhost:5000`.

