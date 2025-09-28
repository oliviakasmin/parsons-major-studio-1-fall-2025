# Parsons Major Studio 1 Projects

This directory contains all projects for Parsons Major Studio 1, with shared Git hooks and configuration.

## 🛠️ Shared Configuration

### Git Hooks

- **Pre-commit hook** runs automatically on `git commit`
- **TypeScript type checking** for projects with `tsconfig.json`
- **ESLint linting** for projects with `lint-staged` configuration
- **Prettier formatting** for staged files

### Shared Files

- **`.prettierrc`** - Prettier formatting rules (shared across all projects)
- **`.prettierignore`** - Prettier ignore patterns (shared across all projects)
- **`.gitignore`** - Git ignore rules (shared across all projects)
- **`.husky/`** - Git hooks (shared across all projects)
- **`.vscode/settings.json`** - VS Code settings (shared across all projects)

### Project Structure

```
projects/
├── .husky/           # Git hooks (shared across all projects)
├── .gitignore        # Shared ignore rules
├── .prettierrc       # Shared Prettier configuration
├── .prettierignore   # Shared Prettier ignore patterns
├── .vscode/          # VS Code settings (shared across all projects)
│   └── settings.json
├── package.json      # Parent package for husky management
└── quantitative/     # Individual project directories
    ├── src/
    ├── package.json
    ├── .eslintrc.cjs # Project-specific ESLint config
    └── ...
```

## 📋 How It Works

The pre-commit hook automatically:

1. **Scans all subdirectories** for `package.json` files
2. **Runs TypeScript checks** if `tsconfig.json` exists
3. **Runs lint-staged** if configured in `package.json`
4. **Blocks commits** if any checks fail

## 🚀 Adding New Projects

To add a new project:

1. Create a new directory with your project
2. Add a `package.json` file
3. For TypeScript projects: add `tsconfig.json`
4. For linting: add `lint-staged` configuration to `package.json`

The pre-commit hook will automatically detect and check your new project!

## 🔧 Commands

- **Install dependencies**: `npm install` (from projects directory)
- **Test pre-commit hook**: `.husky/pre-commit`
- **Bypass hooks**: `git commit --no-verify` (not recommended)
