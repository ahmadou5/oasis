# Contributing to Stakeit

Thank you for your interest in contributing to Stakeit! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. **Fork the repository** and clone your fork locally
2. **Install dependencies**: `npm install`
3. **Create a branch** for your feature: `git checkout -b feature/amazing-feature`
4. **Start development server**: `npm run dev`

## Code Style

We use the following tools to maintain code quality:

- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting (run `npm run format`)

### Code Style Guidelines

- Use TypeScript for all new code
- Follow React functional component patterns with hooks
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused on a single responsibility

## Testing

- Write tests for new features and bug fixes
- Run tests with `npm test`
- Ensure all tests pass before submitting a PR
- Aim for good test coverage on critical functionality

## Commit Messages

Use clear and descriptive commit messages following this format:

```
type: brief description

Longer description if needed
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat: add validator filtering by data center
fix: resolve wallet connection issue on mobile
docs: update API documentation for staking endpoints
```

## Pull Request Process

1. **Update documentation** if your changes affect the API or user interface
2. **Add tests** for new functionality
3. **Update the README** if needed
4. **Ensure CI passes** - all tests and linting must pass
5. **Request review** from maintainers
6. **Address feedback** promptly and professionally

### PR Title Format
Use the same format as commit messages:
```
feat: add staking rewards calculator
```

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested this change locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes
```

## Development Guidelines

### Component Structure
```typescript
interface ComponentProps {
  // Define props with TypeScript interfaces
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic here
  
  return (
    <div className="component-styles">
      {/* JSX here */}
    </div>
  )
}
```

### State Management
- Use Redux Toolkit for global state
- Use React hooks (useState, useEffect) for local component state
- Follow the existing patterns in the codebase

### Styling
- Use Tailwind CSS utility classes
- Follow the existing color scheme (Solana purple/green)
- Ensure responsive design on all screen sizes
- Use the predefined component classes in `globals.css`

### API Integration
- Use the existing API patterns
- Handle loading and error states properly
- Validate input data
- Follow REST conventions for new endpoints

## Security Considerations

- Never commit private keys or sensitive data
- Validate all user inputs
- Use proper error handling
- Follow Solana security best practices
- Be mindful of wallet integration security

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for complex functions
- Include examples in documentation
- Keep API documentation up to date

## Issues and Bug Reports

When reporting bugs, please include:

1. **Description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior**
4. **Actual behavior**
5. **Environment** (browser, OS, wallet, etc.)
6. **Screenshots** if helpful

## Feature Requests

For feature requests, please provide:

1. **Clear description** of the feature
2. **Use case** - why is this feature needed?
3. **Proposed implementation** (if you have ideas)
4. **Alternatives considered**

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Give constructive feedback
- Focus on what's best for the community
- Be patient with newcomers

## Getting Help

If you need help:

1. Check existing [issues](https://github.com/your-username/stakeit/issues)
2. Join our Discord community
3. Ask questions in GitHub discussions
4. Reach out to maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions for outstanding contributions

Thank you for contributing to Stakeit! 🚀