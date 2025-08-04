
# MegiLance Frontend

This is the frontend for MegiLance, a next-generation freelance platform powered by AI and blockchain. It is built with Next.js, TypeScript, and follows a strict component-based architecture.

---

## ⚠️ Core Architecture & Styling Guidelines

These rules are **mandatory** for all developers and AI agents to ensure code quality, maintainability, and scalability.

- **No Global CSS:** All styling is scoped to individual components. The global `globals.css` file is intentionally unused.
- **Component-Scoped Styles:** Each component has its own set of stylesheets (`.common.css`, `.light.css`, `.dark.css`). This prevents style collisions and makes components self-contained.
- **TypeScript is Mandatory:** All new code must be written in TypeScript with full type safety.
- **AI-HINT Comments:** Every file must begin with an `@AI-HINT` comment explaining its purpose. This is crucial for AI-assisted development and automation.

---

## 🚀 Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 📂 Project Structure

- **/app:** Contains all pages and layouts, following the Next.js App Router structure.
- **/app/components:** Houses the reusable component library, organized by category (atomic, PWA, AI, etc.).
- **/app/contexts:** Includes all React Context providers, such as the `ThemeContext`.
- **/public:** Stores static assets like icons, images, and the `manifest.json`.
- **/styles:** Contains the base font definitions. **No component styles go here.**

---

## 🎨 Component Library

This project uses a component-based approach. All reusable UI elements are located in `/app/components`.

### Atomic Components
- **Button:** A versatile button component with theme support.
- **UserAvatar:** Displays a user's avatar or initials.
- **Table:** A generic table for displaying data.
- **ProgressBar:** A visual progress bar.
- **And more...**

### AI-Powered Components
- **PriceEstimator:** Provides AI-driven price estimations for projects.
- **FreelancerRankVisualizer:** Displays a freelancer's rank and score.
- **SentimentAnalyzer:** Analyzes and shows the sentiment of a given text.
- **ChatbotAgent:** A full-featured chat interface for interacting with the AI assistant.
- **FraudAlertBanner:** A security banner to alert users of potential fraud.

### PWA & Integration
- **InstallAppBanner:** Prompts users to install the application as a PWA.
- **UpdateNotification:** Notifies users when a new version of the app is available.

---

## 👨‍💻 Author

- **Ghulam Mujtaba**
- **Portfolio:** ghulammujtaba.com
- **GitHub:** @ghulam-mujtaba5
- **LinkedIn:** @ghulamujtabaofficial


AI agents and developers should reference the following project documentation files before starting or modifying any features:

| Document | Description |
|---------|-------------|
| [MegiLance-Brand-Playbook.md](../MegiLance-Brand-Playbook.md) | Visual identity, color palette, typography, brand tone |
| [MegiLance-Implementation-Plan.md](../MegiLance-Implementation-Plan.md) | Step-by-step roadmap for frontend & backend rollout |
| [MegiLance-Recommended-Stack.md](../MegiLance-Recommended-Stack.md) | Technologies selected for frontend, backend, AI, blockchain |
| [MegiLance-Requirements-and-Specification.md](../MegiLance-Requirements-and-Specification.md) | Functional and non-functional requirements, user stories |

> 🧠 **AI Agents**: You must read all of the above before suggesting, generating, or modifying components.

---

