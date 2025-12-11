# AI-based-network — Frontend

The frontend is a web-based interface that allows users to chat with the AI assistant and visualize generated network topologies (star, ring, bus, mesh, line) in real time.
Built with React, TypeScript, Material UI, and React Flow.

## Setup Instructions

### Prerequisites

- Node.js (LTS)
- npm package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```
### Running the Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port shown in terminal).

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


