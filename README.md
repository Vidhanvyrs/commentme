# commentme

A CLI tool to manage and store cluttered-code comments and give the codebase a clean look. Extract comments from your code files, store them in a database, and restore them later.

## Installation

npm install -g commentme## Usage

# Show help
commentme --help

# Get all comments
commentme --get lines

# Get a specific comment
commentme --get line-1-6

# Add a comment
commentme --add 1-6

# Edit a comment
commentme --edit line-1-6

# Delete a comment
commentme --delete line-1-6

# Redact comments from a file 
commentme --skim <file>

# Restore comments to a file
commentme --unskim <file>

# Logout
commentme --logout## Features

- Store code comments in MongoDB
- Redact comments from files while keeping references
- Restore comments back to files
- User authentication and session management
- Per-codebase comment organization

## Requirements

- Node.js >= 18.0.0

## License

MIT
