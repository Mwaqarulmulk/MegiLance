
# MegiLance Frontend

This is the frontend for MegiLance, a next-generation freelance platform powered by AI and blockchain. It is built with Next.js, TypeScript, and follows a strict component-based architecture.

---

## ⚠️ Core Architecture & Styling Guidelines

These rules are **mandatory** for all developers and AI agents to ensure code quality, maintainability, and scalability.

- **No Global CSS:** All styling is scoped to individual components. The global `globals.css` file is intentionally unused.
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

## 🎨 Theming System

The MegiLance frontend features a robust, fully implemented theme-switching capability that supports both light and dark modes. The system is designed for consistency, scalability, and ease of use.

### Architecture

- **`ThemeContext`**: A global context (`app/contexts/ThemeContext.tsx`) provides the current theme (`'light'` or `'dark'`) and a `toggleTheme` function to all components.
- **Per-Component CSS Modules**: Every component has three dedicated stylesheets:
  - `Component.common.module.css`: Base styles that are theme-agnostic.
  - `Component.light.module.css`: Styles specific to the light theme.
  - `Component.dark.module.css`: Styles specific to the dark theme.
- **`cn` Utility**: The `cn` utility from `lib/utils` is used to conditionally merge common and theme-specific class names, ensuring a clean and predictable application of styles.

### Applying Themes to Components

When creating or refactoring a component, follow this pattern to ensure it is fully theme-aware:

1.  **Import Dependencies**:

    ```typescript
    import { useTheme } from '@/app/contexts/ThemeContext';
    import { cn } from '@/lib/utils';
    import commonStyles from './Component.common.module.css';
    import lightStyles from './Component.light.module.css';
    import darkStyles from './Component.dark.module.css';
    ```

2.  **Access Theme and Styles**:

    ```typescript
    const { theme } = useTheme();
    if (!theme) return null; // Prevents UI flash before theme is resolved
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
    ```

3.  **Apply Classes to Elements**:

    ```jsx
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <p className={cn(commonStyles.text, themeStyles.text)}>Hello, world!</p>
    </div>
    ```

This pattern has been applied to all major components, creating a pixel-perfect, investor-grade UI that is consistent across the entire application.

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

