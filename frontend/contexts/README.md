# Frontend Contexts

> @AI-HINT: Reserved directory for React context providers

## Current State

This directory is intentionally empty. Context providers and hooks currently live in:

- **`app/components/providers/`** — `AuthProvider`, `WebSocketProvider`, theme providers
- **`hooks/`** — `useAuth`, `useWebSocket`, `useTheme` and other custom hooks

## Why This Directory Exists

It was created as a future home for extracted context modules when the providers
directory grows large enough to warrant separation by domain.
