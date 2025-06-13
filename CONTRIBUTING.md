# Contributing to neco-porter

First off, thank you for considering contributing to neco-porter! It's people like you that make neco-porter such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the [neco-porter Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [project maintainers].

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
   make test
   ```

4. **Run the linter**
   ```bash
   make lint
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
   # Example - adjust based on the project's tech stack
   npm install
   # or
   pip install -r requirements.txt
   # or
   go mod download
   ```

3. **Set up your environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

4. **Run the development server**
   ```bash
   make dev
   # or
   npm run dev
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
make test

# Run specific test file
make test TEST=test_specific.py

# Run with coverage
make test-coverage
```

## Review Process

1. A maintainer will review your PR
2. They may request changes or ask questions
3. Make requested changes in new commits
4. Once approved, your PR will be merged

## Community

- Join our [Discord/Slack/Forum]
- Follow our [Twitter/Blog]
- Participate in discussions

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Our website

## Questions?

Feel free to open an issue with your question or reach out to the maintainers directly.

Thank you for contributing to neco-porter! 🎉