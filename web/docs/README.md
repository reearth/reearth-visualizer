---
title: "Re:Earth Visualizer Web - Documentation Hub"
last_updated: "2026-06-04"
---

# Re:Earth Visualizer Web - Documentation

Welcome to the comprehensive documentation for Re:Earth Visualizer Web, a cutting-edge GIS application built with React 19, TypeScript, and Cesium for 3D geospatial visualization.

## Quick Links

- **[Getting Started](guides/getting-started.md)** - Set up your development environment
- **[Project Overview](../CLAUDE.md)** - High-level project introduction
- **[Architecture Overview](architecture/overview.md)** - System architecture and design
- **[API Reference](reference/commands.md)** - Command reference and APIs

## Documentation Structure

### 📚 Guides

Step-by-step guides for common tasks:

- **[Getting Started](guides/getting-started.md)** - Initial setup and first steps
- **[Adding New Features](guides/adding-features.md)** - How to add features to the application
- **[Working with GraphQL](guides/working-with-graphql.md)** - GraphQL development workflow
- **[Deployment Guide](guides/deployment.md)** - Deploying the application

### 🏗️ Architecture

System design and architectural decisions:

- **[Architecture Overview](architecture/overview.md)** - High-level system architecture
- **[Data Flow](architecture/data-flow.md)** - How data flows through the application
- **[State Management](architecture/state-management.md)** - Jotai state management patterns
- **[ADRs](architecture/adr/)** - Architecture Decision Records

### 🔧 Modules

Detailed documentation for each major module:

#### Services Layer

- **[Configuration](modules/services/config.md)** - App configuration and feature flags
- **[API](modules/services/api.md)** - API layer and service integration
- **[Authentication](modules/services/auth.md)** - Auth0 and Cognito integration
- **[GraphQL](modules/services/gql.md)** - GraphQL queries and mutations

#### Features Layer

- **[Editor](modules/features/editor.md)** - Map editor functionality
- **[Dashboard](modules/features/dashboard.md)** - Dashboard and project management
- **[Visualizer](modules/features/visualizer.md)** - 3D visualization features

#### UI Layer

- **[UI Components](modules/ui/components.md)** - Reusable UI components
- **[Design System](modules/ui/design-system.md)** - Design tokens and patterns

### 💡 Concepts

Cross-cutting concepts and patterns:

- **[Authentication](concepts/authentication.md)** - Authentication architecture
- **[Feature Flags](concepts/feature-flags.md)** - Feature flag system
- **[3D Rendering](concepts/3d-rendering.md)** - Cesium integration and 3D rendering
- **[Internationalization](concepts/internationalization.md)** - i18n system
- **[Testing Strategy](concepts/testing-strategy.md)** - Testing approach and patterns

### ⚙️ Setup

Environment setup and configuration:

- **[1Password Setup](setup/1password-setup.md)** - Secure environment variable management
- **[Custom Providers](setup/custom-providers.md)** - Custom tile and terrain providers
- **[Local Development](setup/local-development.md)** - Development environment setup

### 📖 Reference

Quick reference materials:

- **[Commands](reference/commands.md)** - CLI commands and scripts
- **[Environment Variables](reference/environment-variables.md)** - All environment variables
- **[Code Conventions](reference/code-conventions.md)** - Coding standards and style guide

### 📝 Templates

Templates for creating new documentation:

- **[Module Guide Template](templates/module-guide.md)**
- **[Feature Guide Template](templates/feature-guide.md)**
- **[Concept Guide Template](templates/concept-guide.md)**
- **[ADR Template](templates/adr-template.md)**
- **[Troubleshooting Template](templates/troubleshooting.md)**

## Documentation for AI/LLM

This documentation is structured to be AI-friendly:

- **Structured Metadata**: All docs include YAML frontmatter with metadata
- **Consistent Format**: Templates ensure consistent structure across all docs
- **Cross-References**: Extensive linking between related documents
- **Code References**: Direct links to code locations (`file:line`)
- **Machine-Readable Index**: See [index.json](index.json) for structured navigation

### For AI Tools

When analyzing this codebase:

1. Start with [index.json](index.json) for structured navigation
2. Check [architecture/overview.md](architecture/overview.md) for system understanding
3. Browse modules by layer: services → features → ui
4. Review concepts for cross-cutting concerns
5. Use code references in docs to locate implementations

## Key Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **3D Engine**: Cesium (3D globes and maps)
- **State Management**: Jotai
- **GraphQL**: Apollo Client with code generation
- **UI Components**: Custom components with Emotion styling
- **Auth**: Auth0 + AWS Cognito
- **Testing**: Vitest + React Testing Library
- **Package Manager**: Yarn 4.6.0

## Development Workflow

### Common Commands

```bash
# Development
yarn start              # Start dev server
yarn start:op           # Start with 1Password secrets

# Code Quality
yarn type               # Type checking
yarn lint               # Lint code
yarn fix                # Auto-fix issues
yarn format             # Format code
yarn check              # Run all checks

# Testing
yarn test               # Run tests
yarn coverage           # Test coverage

# Tools
yarn storybook          # Component development
yarn gql                # Generate GraphQL types
yarn i18n               # Extract translations
```

See [Commands Reference](reference/commands.md) for complete list.

## Project Structure

```
web/
├── src/
│   ├── app/              # Application features and UI
│   │   ├── features/     # Feature components
│   │   ├── pages/        # Page components
│   │   ├── ui/           # Reusable UI components
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utility functions
│   └── services/         # Core services
│       ├── api/          # API layer
│       ├── auth/         # Authentication
│       ├── config/       # Configuration
│       ├── gql/          # GraphQL
│       └── i18n/         # Internationalization
├── docs/                 # This documentation
└── dist/                 # Build output
```

## Contributing to Documentation

### Adding New Documentation

1. **Choose appropriate template** from `docs/templates/`
2. **Copy template** to correct location in docs structure
3. **Fill in all sections** following the template structure
4. **Add YAML frontmatter** with accurate metadata
5. **Update index.json** using `yarn docs:update-index`
6. **Link from related docs** to create navigation paths

### Documentation Standards

- **Use YAML frontmatter** for all documents
- **Include code references** (`src/path/file.ts:line`)
- **Add examples** for all concepts and APIs
- **Link liberally** to related documentation
- **Keep docs updated** when code changes
- **Follow markdown linting** rules (MD032, MD034)

### Automated Tools

```bash
# Generate module documentation skeleton
yarn docs:generate --module services/config

# Validate documentation
yarn docs:validate

# Update documentation index
yarn docs:update-index
```

## Maintaining Documentation

### When to Update Documentation

- ✅ **When adding new features** - Create feature guide
- ✅ **When adding new modules** - Create module guide
- ✅ **When making architectural decisions** - Create ADR
- ✅ **When changing APIs** - Update API reference
- ✅ **When fixing bugs** - Add to troubleshooting if relevant
- ✅ **When changing configuration** - Update config docs

### Documentation Review Checklist

- [ ] YAML frontmatter is complete and accurate
- [ ] All code references point to current code
- [ ] Examples are tested and working
- [ ] Links to related docs are current
- [ ] Markdown linting passes
- [ ] index.json is updated

## Getting Help

### Documentation Issues

If you find issues with documentation:

1. Check if there's a more recent version
2. Search for related documentation
3. Open an issue with specific details
4. Propose improvements via PR

### Code Issues

For code-related help:

- **Troubleshooting**: Check relevant troubleshooting guides
- **Issues**: Search existing issues
- **Team**: Contact maintainers listed in doc frontmatter

## External Resources

- **[Re:Earth Project](https://github.com/reearth/reearth-visualizer)** - Main repository
- **[Cesium Documentation](https://cesium.com/docs/)** - 3D engine docs
- **[React Documentation](https://react.dev/)** - React docs
- **[Jotai Documentation](https://jotai.org/)** - State management docs
- **[Vite Documentation](https://vitejs.dev/)** - Build tool docs

## Changelog

### 2026-06-04 - Documentation System Overhaul

- Created modular documentation structure
- Added templates for consistent documentation
- Implemented AI-friendly metadata system
- Added automated documentation tools
- Migrated existing documentation to new structure

---

**Last Updated**: 2026-06-04
**Maintained By**: Platform Team
**Questions?** Open an issue or contact the team
