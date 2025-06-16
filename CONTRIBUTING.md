# Contributing to Neco Porter 🐱

First off, thank you for considering contributing to Neco Porter! Your contributions help make port management more delightful for developers everywhere.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming environment. Be kind, respectful, and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue to identify the problem
- **Describe the exact steps which reproduce the problem** in as many details as possible
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs** if possible
- **Include your environment details** (OS, version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title** for the issue
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and **explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these issues:

- Issues labeled `good first issue` - issues which should only require a few lines of code
- Issues labeled `help wanted` - issues which need extra attention

### Pull Requests

The process described here has several goals:

- Maintain neco-porter's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible neco-porter
- Enable a sustainable system for maintainers to review contributions

Please follow these steps:

1. **Fork the repo and create your branch from `main`**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes**
   - Write clear, commented code
   - Follow the existing code style
   - Add tests if applicable

3. **Ensure the test suite passes**
   ```bash
   npm test
   ```

4. **Run the linter**
   ```bash
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add some feature"
   ```
   
   Follow our commit message conventions:
   - Use the present tense ("Add feature" not "Added feature")
   - Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
   - Limit the first line to 72 characters or less
   - Reference issues and pull requests liberally after the first line

6. **Push to your fork**
   ```bash
   git push origin feature/my-new-feature
   ```

7. **Submit a Pull Request**

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/R9a00/neco-porter.git
   cd neco-porter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install system dependencies**
   ```bash
   # macOS
   brew install jq
   
   # Ubuntu/Debian
   sudo apt-get install jq
   
   # Other systems
   # Visit https://stedolan.github.io/jq/download/
   ```

4. **Run the development daemon**
   ```bash
   npm run dev
   # or
   ./bin/necoportd
   ```

## Style Guidelines

### Code Style

- Follow the language-specific style guide
- Use meaningful variable and function names
- Comment your code where necessary
- Keep functions small and focused
- Write self-documenting code

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Example:
```
Fix port allocation race condition

- Add mutex lock around port allocation
- Update tests to verify thread safety
- Refactor allocation logic for clarity

Fixes #123
```

### Documentation Style

- Use clear, simple language
- Include code examples where helpful
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

## Testing

- Write tests for new features
- Update tests when modifying existing features
- Ensure all tests pass before submitting PR
- Aim for high test coverage

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
node --test test/necoportd.test.js

# Run linter
npm run lint
```

## Review Process

1. A maintainer will review your PR
2. They may request changes or ask questions
3. Make requested changes in new commits
4. Once approved, your PR will be merged

## v2 Development Guidelines

### Working with Multi-Port Features

When contributing to v2 features:
1. Maintain backward compatibility
2. Test with both v1 and v2 clients
3. Update TypeScript definitions
4. Add tests for multi-port scenarios

### Code Organization

- `src/necoportd.js` - v1 daemon (keep unchanged)
- `src/necoportd-v2.js` - v2 daemon with multi-port support
- `src/db-utils.js` - Database utilities and migration
- `lib/necoport.js` - v1 client library
- `lib/necoport-v2.js` - v2 client library
- `bin/necoport-client` - v1 CLI (keep unchanged)
- `bin/necoport-client-v2` - v2 CLI with new features

### Testing v2 Features

```bash
# Run v2 daemon
./src/necoportd-v2.js &

# Test multi-port allocation
./bin/necoport-client-v2 exec test --ports a,b,c bash -c 'env | grep PORT'

# Test backward compatibility
./bin/necoport-client exec test npm run dev
```

## Cat ASCII Art Guidelines

When adding new cat ASCII art:
- Keep them under 20 characters wide
- Use standard ASCII/Unicode characters
- Test in various terminals
- Ensure they bring joy!
- Add them to the `getCatForPort` function in `src/necoportd.js` and `src/necoportd-v2.js`

Example:
```
(=^･ω･^=)  # Classic cat
(=^‥^=)    # Content cat
(=｀ω´=)   # Determined cat
```

## Community

- Report issues on [GitHub Issues](https://github.com/R9a00/neco-porter/issues)
- Discuss features in [GitHub Discussions](https://github.com/R9a00/neco-porter/discussions)

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Git commit history

## Questions?

Feel free to open an issue with your question!

Thank you for contributing to Neco Porter! 🐱✨