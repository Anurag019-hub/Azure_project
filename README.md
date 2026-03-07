# Frontend

A modern, scalable React frontend application built with **Vite**, **Tailwind CSS**, and **Axios**.

## Tech Stack

- **React 18** — UI library
- **Vite** — Lightning-fast build tool
- **Tailwind CSS** — Utility-first CSS framework
- **Axios** — HTTP client for API requests
- **React Router** — Client-side routing

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will open at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── public/                 # Static assets served as-is
│   └── index.html
├── src/
│   ├── assets/             # Project assets
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   ├── components/         # Reusable components
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page-level components
│   ├── services/           # API services and integrations
│   │   └── api.js
│   ├── styles/             # Global and shared styles
│   │   └── globals.css
│   ├── utils/              # Utility functions and helpers
│   ├── App.jsx             # Root application component
│   └── main.jsx            # Application entry point
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## License

MIT
