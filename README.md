# CommentMe 🚀

**Declutter your codebase without losing context.**

CommentMe is an AI-powered CLI toolkit designed for developers who value clean, readable code. It allows you to "skim" comments out of your source files into a secure vault, keeping your core logic pristine while maintaining a searchable, UI-friendly history on the web.

### Key Capabilities:
- 🧼 **Clean Code, Zero Loss**: Redact comments from files while keeping references for instant restoration.
- 🤖 **AI Documentation**: Generate JSDocs and per-function comments automatically with LLMs.
- 🧠 **Smart Explainer**: Get instant markdown-formatted architecture explanations for any code file.
- 🌐 **Cloud Integration**: Manage and edit your extracted comments through a streamlined web interface.

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
 
