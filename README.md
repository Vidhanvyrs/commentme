# commentme

An Open Source CLI tool to manage and store your cluttered-code comments and give the codebase a clean look. Extract comments from your code files, store them in a database, visit commentme platform for UI-friendly seek and restore your comments line-wise later.

## Installation

npm install -g commentme

## Usage

### Show help
commentme --help

### Signup
commentme --signup

### Login
commentme --login

### Get all comments
commentme --get lines "file-name"

### Get a specific comment
commentme --get line-7-7 "file-name"

### Edit a comment
commentme --edit line-7-7 "file-name"

### Delete a comment
commentme --delete line-7-7 "file-name"

### Redact comments from a file 
commentme --skim "file-name"

### Restore comments to a file
commentme --unskim "file-name"

### Logout
commentme --logout

## Features

- Clutter-free and smooth codebase
- Redact comments from files while keeping references
- Restore comments back to files whenever required
- User authentication and session management 
- Per-codebase comment organization
- Dedicated website for more UI friendly & AI edits on comments

## Requirements

- Node.js >= 18.0.0

## License

MIT
 
