# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-15

### Added
- **Authentication**: GitHub OAuth integration using Supabase Auth.
- **Project Dashboard**: View and manage analyzed repositories.
- **GitHub Crawler Engine**:
  - Smart filtering of repository files (ignoring node_modules, binaries, etc.).
  - Priority file detection (package.json, main entry points).
  - Recursive directory tree scanning via GitHub API.
- **AI Documentation Engine**:
  - Integration with Google Gemini 1.5 Flash.
  - Real-time streaming of generated Markdown content.
  - Specialized "Senior Technical Writer" system prompt for high-quality READMEs.
- **Workspace Editor**:
  - Split-pane interface with live Markdown preview.
  - Interactive project structure sidebar.
  - Markdown editor powered by `@uiw/react-md-editor`.
- **Storage System**:
  - Persistence for projects and documents in Supabase (PostgreSQL).
  - Draft and Completion status management via Server Actions.
- **Utility Features**:
  - One-click copy to clipboard for Markdown content.
  - Download documentation as `README.md` file.
- **CI/CD Pipeline**:
  - Automated linting and type-checking.
  - Unit testing suite with Vitest.
  - End-to-End (E2E) testing suite with Playwright.
  - Automated GitHub Actions workflow.

### Changed
- Improved AI prompt for more accurate technical architecture descriptions.
- Optimized repository scanning speed using parallel file fetching.

### Fixed
- Resolved 404/403 errors with Gemini API by switching to `gemini-1.5-flash-latest` and fixing API endpoint calls.
- Corrected various UI/UX layout issues in the workspace editor.
- Fixed React state updates within `useEffect` to avoid cascading renders.

---
*Note: This version marks the initial MVP release of OpenDoc AI.*
