# Quantitative Data Visualization

A React + TypeScript + D3.js application for data visualization and analysis.

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **D3.js** - Data visualization
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Data Processing

- **Python** - Data analysis and processing
- **Jupyter Notebooks** - Interactive data exploration
- **Pandas** - Data manipulation and analysis
- **Matplotlib** - Data visualization

## 📁 Project Structure

```
quantitative/
├── src/
│   ├── App.tsx          # Main React component
│   ├── App.css          # Component styles
│   ├── main.tsx         # React entry point
│   ├── index.css        # Global styles
│   └── charts/          # Chart components
│       ├── CategoriesBarChart.tsx
│       └── index.ts
├── data/                # Data files and analysis
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tsconfig.node.json   # TypeScript Node.js configuration
├── vite.config.ts       # Vite configuration
├── .eslintrc.cjs        # ESLint configuration
└── index.html           # Entry point
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (outputs to dist/)
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## 📝 Deployment Notes

This project contains only the essential files needed for deployment:

- **Build Configuration**: `vite.config.ts`, `tsconfig.json`
- **Dependencies**: `package.json`, `package-lock.json`
- **Source Code**: `src/` directory
- **Entry Point**: `index.html`
- **ESLint Config**: `.eslintrc.cjs` (project-specific due to plugin dependencies)

Shared configuration files (Prettier, Git hooks, VS Code settings) are managed by the parent directory.
