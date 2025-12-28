# commentme

A CLI tool to manage and store cluttered-code comments and give the codebase a clean look. Extract comments from your code files, store them in a database, and restore them later.

## Installation

npm install -g commentme

## Usage

# Show help
commentme --help

# Get all comments
commentme --get lines

# Get a specific comment
commentme --get line-7-7 <file>


# Edit a comment
commentme --edit line-7-7 <file>

# Delete a comment
commentme --delete line-7-7 <file>

# Redact comments from a file 
commentme --skim <file>

# Restore comments to a file
commentme --unskim <file>

# Logout
commentme --logout

## Features

- Clutter-free and smooth codebase
- Redact comments from files while keeping references
- Restore comments back to files whenever required
- User authentication and session management
- Per-codebase comment organization
- Dedicated website for more UI friendly edits on comments

## Requirements

- Node.js >= 18.0.0

## License

MIT
