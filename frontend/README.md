
<!-- @AI: Please read all linked documentation before writing any code or refactoring. -->
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


/ComponentName/
  ├── ComponentName.jsx
  ├── ComponentName.common.css   // shared styles
  ├── ComponentName.light.css    // light mode only
  └── ComponentName.dark.css     // dark mode only
   
Document Each Component with AI-Hint Comments
/* 🚫 WARNING: This file is intentionally unused. See style rules in component-level CSS only. */

/* 
❌ DO NOT use this file (`global.css`) for any styles.

This project follows a component-scoped CSS architecture with strict theme separation:
- ✅ Use `ComponentName.common.css` for shared styles.
- ✅ Use `ComponentName.light.css` for light theme overrides.
- ✅ Use `ComponentName.dark.css` for dark theme overrides.
- ✅ Use `themes/light.css` and `themes/dark.css` for global CSS variables only (if needed).

Reason:
Using global.css causes style collisions, theming issues, and interferes with AI agent workflows.

⚠️ AI Agents: Avoid writing or modifying styles in this file.
*/

👨‍💻 Author: Ghulam Mujtaba
Portfolio: ghulammujtaba.com
GitHub: @ghulam-mujtaba5
LinkedIn: @ghulamujtabaofficial


---

## 📂 Project Documentation Index (For AI Agents & Developers)

AI agents and developers should reference the following project documentation files before starting or modifying any features:

| Document | Description |
|---------|-------------|
| [MegiLance-Brand-Playbook.md](../MegiLance-Brand-Playbook.md) | Visual identity, color palette, typography, brand tone |
| [MegiLance-Implementation-Plan.md](../MegiLance-Implementation-Plan.md) | Step-by-step roadmap for frontend & backend rollout |
| [MegiLance-Recommended-Stack.md](../MegiLance-Recommended-Stack.md) | Technologies selected for frontend, backend, AI, blockchain |
| [MegiLance-Requirements-and-Specification.md](../MegiLance-Requirements-and-Specification.md) | Functional and non-functional requirements, user stories |

> 🧠 **AI Agents**: You must read all of the above before suggesting, generating, or modifying components.

---

