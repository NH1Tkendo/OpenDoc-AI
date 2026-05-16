# OpenDoc-AI

## Badges

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/NH1Tkendo/OpenDoc-AI/main.yml?branch=main)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-0.1.0-informational.svg)

## Project Title & Description

**OpenDoc-AI** is a robust, AI-powered platform designed for intelligent document creation and dynamic design system generation. It leverages a modular agent framework to automate the production of comprehensive branding assets, design system tokens, UI components, and various content types like marketing banners, logos, and presentation slides.

This project aims to streamline the creative workflow by allowing users to interact with specialized AI agents to analyze requirements, generate content, and apply consistent design principles, making complex design and documentation tasks accessible and efficient.

## Tech Stack

OpenDoc-AI is built using a modern and scalable technology stack:

-   **Frontend:**
    -   [Next.js](https://nextjs.org/) (React Framework)
    -   [TypeScript](https://www.typescriptlang.org/)
-   **UI & Styling:**
    -   [Shadcn UI](https://ui.shadcn.com/) (Component Library)
    -   [Radix UI](https://www.radix-ui.com/) (UI Primitives)
    -   [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
    -   [Next-Themes](https://github.com/pacocoursey/next-themes) (Theme switching)
-   **AI Integration:**
    -   [Google Generative AI](https://ai.google.dev/) (for AI model interaction)
-   **Backend & Authentication:**
    -   [Supabase](https://supabase.com/) (Auth Helpers for Next.js, Supabase JS client)
-   **Containerization:**
    -   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
-   **Development & Testing:**
    -   [Node.js](https://nodejs.org/) (Runtime for JavaScript/TypeScript components)
    -   [Python](https://www.python.org/) (Runtime for specific AI skill scripts)
    -   [Vitest](https://vitest.dev/) (Unit Testing Framework)
    -   [Playwright](https://playwright.dev/) (End-to-End Testing Framework)
    -   [ESLint](https://eslint.org/) (Code Linting)
-   **Utilities:**
    -   `@uiw/react-md-editor` (Markdown editor component)
    -   `lucide-react` (Icon library)
    -   `clsx`, `tailwind-merge` (CSS utility helpers)

## Architecture

OpenDoc-AI employs a modular, agent-based architecture designed for extensibility and specialized AI capabilities:

1.  **Core Application (`opendoc-ai/`):**
    *   A Next.js 14+ application that serves as the primary user interface and API gateway.
    *   Manages user authentication (via Supabase), project workspaces, and orchestrates interactions with the underlying AI agent system.
    *   Provides API endpoints (`/api/analyze`, `/api/generate`) to process user requests and route them to relevant AI skills.

2.  **AI Agent Framework (`.agents/skills/`):**
    *   The core of the AI intelligence, comprising a collection of specialized AI "skills" or modules.
    *   Each skill is self-contained and focused on a specific domain of content generation or design, such as:
        *   `ckm-brand`: For managing and generating brand guidelines, including color palettes, typography, and logo usage.
        *   `ckm-design-system`: For generating and validating design tokens, slide layouts, and component specifications.
        *   `ckm-design`: Encompasses broader design tasks like creating logos, icons, marketing banners, and presentation slides.
        *   `ckm-ui-styling`: Handles UI styling, including font management, Tailwind CSS customization, and Shadcn UI component integration.
        *   `ckm-slides`: Focuses on presentation slide creation with specific copywriting formulas and layout patterns.
    *   Each skill typically includes:
        *   `SKILL.md`: A description of the skill's purpose and capabilities.
        *   `references/`: Domain-specific knowledge base, guidelines, or best practices that inform the AI's generation process.
        *   `data/`: Structured data (e.g., CSVs, JSON) that provides context or options for the AI (e.g., slide backgrounds, logo styles).
        *   `scripts/`: Python (`.py`) and Node.js (`.cjs`) scripts that implement the operational logic for the skill, such as extracting information, generating assets, or performing validation.
        *   `templates/`: Starter templates for various output formats (e.g., brand guidelines, design tokens).

3.  **Data Persistence:**
    *   Supabase is utilized for managing user authentication and potentially for storing project-related data or user preferences.

This architecture allows for flexible expansion by adding new skills, each with its specialized knowledge and tools, enabling OpenDoc-AI to tackle a wide array of creative and documentation challenges.

## Installation

Follow these steps to set up OpenDoc-AI locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v20 or higher)
*   [npm](https://www.npmjs.com/) (or [Yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), [Bun](https://bun.sh/))
*   [Git](https://git-scm.com/)
*   (Optional) [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) for containerized deployment

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/NH1Tkendo/OpenDoc-AI.git
    cd OpenDoc-AI/opendoc-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    # or bun install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the `opendoc-ai` directory based on the following:
    ```
    # Supabase configuration
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

    # Google Generative AI (Gemini) API Key
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
    *   Obtain your Supabase project URL and anonymous key from your [Supabase dashboard](https://supabase.com/).
    *   Obtain your Google Generative AI (Gemini) API key from the [Google AI Studio](https://ai.google.dev/).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000`.

### Docker Setup (Optional)

For a containerized environment, you can use Docker Compose:

1.  **Navigate to the `opendoc-ai` directory:**
    ```bash
    cd OpenDoc-AI/opendoc-ai
    ```

2.  **Prepare environment variables for production:**
    Create a `.env.production` file (similar to `.env.local` above, but typically for production keys).

3.  **Build and run the Docker containers:**
    ```bash
    docker-compose up --build
    ```

4.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000`.

## Usage

Once the application is running, you can begin leveraging OpenDoc-AI's capabilities:

1.  **Login:** Access the application at `http://localhost:3000` and log in using the Supabase authentication flow.

2.  **Create or Select a Project:**
    *   From your dashboard, create a new project or select an existing one to begin working.
    *   Navigate to the `/workspace/new` page to start a new project from scratch.

3.  **Interact with AI Agents:**
    *   Within your project workspace, you'll find an editor (likely powered by `components/workspace-editor.tsx`). This is your primary interface for interacting with the AI.
    *   **Provide Prompts:** Describe your requirements in natural language to the AI. For example:
        *   "Generate a brand guideline document for a tech startup named 'InnovateX' focusing on modern and minimalistic aesthetics, with a blue and white color palette."
        *   "Create a set of design tokens for a web application, including semantic colors, typography scales, and spacing units, compatible with Tailwind CSS."
        *   "Design a social media banner for a product launch event, featuring a futuristic theme and bold typography."
        *   "Compose a 5-slide presentation about the benefits of AI in healthcare, focusing on key statistics and a professional layout."

4.  **Review and Refine Output:**
    *   The AI agents will process your prompts and generate various outputs, which could include Markdown documents, JSON files for design tokens, or visual assets.
    *   Review the generated content and iterate by providing further instructions or refinements to the AI.

OpenDoc-AI empowers you to rapidly prototype, generate, and manage a wide range of creative and informational assets with the assistance of specialized AI intelligence.

## Contributing

We welcome contributions to the OpenDoc-AI project! To contribute, please follow these guidelines:

1.  **Fork the repository:** Start by forking the `NH1Tkendo/OpenDoc-AI` repository to your GitHub account.

2.  **Clone your fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/OpenDoc-AI.git
    cd OpenDoc-AI
    ```

3.  **Create a new branch:** For each new feature or bug fix, create a dedicated branch.
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-description
    ```

4.  **Make your changes:** Implement your feature or fix, ensuring code quality and adherence to existing patterns.

5.  **Run tests:** Before committing, ensure all existing tests pass and add new tests for your changes where appropriate.
    ```bash
    # Run unit tests
    cd opendoc-ai
    npm run test

    # Run end-to-end tests (requires Playwright browsers to be installed)
    npm run test:e2e
    ```

6.  **Run linter:** Ensure your code follows the project's linting rules.
    ```bash
    npm run lint
    ```

7.  **Commit your changes:** Write clear and concise commit messages.
    ```bash
    git commit -m "feat: Add new feature for brand guideline generation"
    # or
    git commit -m "fix: Resolve issue with incorrect color extraction"
    ```

8.  **Push to your branch:**
    ```bash
    git push origin feature/your-feature-name
    ```

9.  **Open a Pull Request:** Navigate to the original `NH1Tkendo/OpenDoc-AI` repository on GitHub and open a pull request from your branch. Provide a detailed description of your changes.

**Adding New AI Skills:**
*   To extend OpenDoc-AI's capabilities, consider creating a new directory under `.agents/skills/` for a specialized AI skill.
*   Ensure the new skill includes `SKILL.md`, relevant `references/`, `data/`, `scripts/`, and `templates/` as needed to define its functionality.

Please refer to `SPEC/SPEC.md` for detailed project specifications and `CHANGELOG.md` for a history of recent changes.
