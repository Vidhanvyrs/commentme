# commentme

An Open Source CLI tool connected with its own website to manage and store your cluttered-code comments and give the codebase a clean look. Extract comments from your code files, store them in a database, visit commentme platform for UI-friendly seek and restore your comments line-wise later.

## Installation
```bash
npm install -g commentme
```

## Usage

### Show help
```bash
commentme --help
```

### Signup
```bash
commentme --signup
```

### Login
```bash
commentme --login
```

### Get all comments
```bash
commentme --get lines "file-name"
```

### Get a specific comment
```bash
commentme --get line-7-7 "file-name"
```

### Edit a comment
```bash
commentme --edit line-7-7 "file-name"
```

### Delete a comment
```bash
commentme --delete line-7-7 "file-name"
```

### Redact comments from a file 
```bash
commentme --skim "file-name"
```

### Restore comments to a file
```bash
commentme --unskim "file-name"
```

### AI Generation
Generate AI comments and JSDoc-style documentation for your code.
```bash
commentme --generate "file-name"
```
You can choose to generate comments per function, per class, or per line.

### AI Explanation
Generate a full markdown explanation of a code file.
```bash
commentme --explain "file-name"
```

### API Key Management
Set your own OpenRouter API key to use the AI features.
```bash
# Set your API key
commentme --set-key

# Clear your saved API key
commentme --clear-key
```

### Logout
```bash
commentme --logout
```

## Features

- **Clutter-free and smooth codebase**
- **Redact comments from files while keeping references**
- **Restore comments back to files whenever required**
- **AI-powered documentation generation (Function/Class/Line level)**
- **Full code explanation generator (Markdown output)**
- **Secure API Key management for custom AI models**
- **User authentication and session management**
- **Per-codebase comment organization**
- **Dedicated website for more UI friendly & AI edits on comments**

## Requirements

- Node.js >= 18.0.0

## License

MIT
 
