// AI-HINT: This file provides custom type definitions for the project.
// It declares CSS modules to TypeScript, allowing them to be imported with type safety.

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
