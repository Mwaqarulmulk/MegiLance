import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // @AI-HINT: The 'style' prop is used for dynamic theming with CSS custom properties.
      // This is a deliberate architectural choice, so we disable the rule that forbids it.
      "@next/next/no-inline-styles": "off",
    },
  },
];

export default eslintConfig;
