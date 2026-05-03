# Testing Infrastructure Documentation

## Overview

This document describes the testing infrastructure for the MegiLance frontend application. The testing setup includes Jest for unit testing, React Testing Library for component testing, and Mock Service Worker (MSW) for API mocking.

## Test Configuration Files

### 1. Jest Configuration (`jest.config.js`)

The Jest configuration file sets up the testing environment with:

- **Test Environment**: `jest-environment-jsdom` for browser-like testing
- **Setup Files**: `jest.setup.js` for global test setup
- **Module Name Mapping**: Resolves module aliases and handles static assets
- **Test File Patterns**: Identifies test files by pattern matching
- **Coverage Configuration**: Defines coverage collection and thresholds
- **Transform Configuration**: Handles transformation of TypeScript and JSX files

### 2. Jest Setup (`jest.setup.js`)

This file runs before each test and provides:

- **Next.js Router Mock**: Mocks the Next.js router for navigation testing
- **Next.js Image Mock**: Mocks the Next.js Image component
- **Next.js Head Mock**: Mocks the Next.js Head component
- **matchMedia Mock**: Mocks window.matchMedia for responsive testing
- **IntersectionObserver Mock**: Mocks IntersectionObserver for performance testing

### 3. MSW Setup (`mocks/server.js`)

Mock Service Worker provides API mocking capabilities:

- **Request Handlers**: Mocks for authentication, user profiles, projects, and messages APIs
- **Server Setup**: Configures the MSW server with request handlers

## Test Structure

### Component Tests

Component tests are colocated with the components they test:

```
components/
  Button/
    Button.tsx
    Button.test.tsx
  Input/
    Input.tsx
    Input.test.tsx
```

### Page Tests

Page tests are colocated with the pages they test:

```
app/
  Home/
    Home.tsx
    Home.test.tsx
  Messages/
    Messages.tsx
    Messages.test.tsx
```

## Writing Tests

### Component Testing Guidelines

1. **Test Props**: Verify that components render correctly with different prop values
2. **Test User Interactions**: Simulate user actions and verify component responses
3. **Test Accessibility**: Ensure components are accessible with proper ARIA attributes
4. **Test Edge Cases**: Test components with missing or invalid props
5. **Mock Dependencies**: Isolate components by mocking external dependencies

### Example Component Test

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../app/components/Button/Button';

describe('Button Component', () => {
  test('renders with default variant and children', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('primary');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Page Testing Guidelines

1. **Test Component Composition**: Verify that pages render all expected components
2. **Test Data Flow**: Ensure data is passed correctly between components
3. **Mock API Calls**: Use MSW to mock API responses for page data
4. **Test Loading States**: Verify how pages handle loading and error states

### Example Page Test

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/Home/Home';

jest.mock('../app/Home/components/Hero', () => {
  return () => <div data-testid="hero-section">Hero Section</div>;
});

describe('Home Page Component', () => {
  test('renders all major sections in correct order', () => {
    render(<Home />);
    
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });
});
```

## Running Tests

### Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- Button.test.tsx
```

### Continuous Integration

Tests are automatically run in the CI pipeline on every pull request. The pipeline enforces:

- All tests must pass
- Coverage thresholds must be met (80% for branches, functions, lines, and statements)
- No console errors or warnings in tests

## Mocking Strategy

### Static Asset Mocking

Static assets like images and stylesheets are mocked using:

- `__mocks__/fileMock.js`: Mocks image imports
- `identity-obj-proxy`: Mocks CSS module imports

### API Mocking

API calls are mocked using MSW:

- `mocks/server.js`: Defines request handlers and sets up the MSW server
- Handlers simulate realistic API responses for testing

### Component Mocking

Child components are mocked in page tests to isolate the component under test:

```typescript
jest.mock('../app/components/Button/Button', () => {
  return ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  );
});
```

## Coverage Requirements

The project enforces 80% coverage for:

- Branches
- Functions
- Lines
- Statements

These thresholds are defined in `jest.config.js` and enforced in the CI pipeline.

## Best Practices

1. **Test Realistic Scenarios**: Write tests that reflect real user interactions
2. **Avoid Implementation Details**: Test behavior rather than implementation
3. **Use Descriptive Test Names**: Make test names clear and specific
4. **Keep Tests Independent**: Each test should be able to run independently
5. **Mock External Dependencies**: Isolate the code under test
6. **Test Edge Cases**: Include tests for error states and boundary conditions
7. **Maintain Test Data**: Keep test data realistic and maintainable
8. **Use Testing Utilities**: Leverage React Testing Library utilities for better tests

## Adding New Tests

To add new tests:

1. Create a `.test.tsx` file next to the component/page being tested
2. Import necessary testing utilities
3. Write tests following the patterns in existing test files
4. Run tests to verify they pass
5. Check coverage to ensure adequate test coverage

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**: Check module name mappings in `jest.config.js`
2. **CSS Module Issues**: Ensure `identity-obj-proxy` is properly configured
3. **Async Testing Issues**: Use `waitFor` for async operations
4. **Mocking Problems**: Verify mocks are correctly implemented

### Debugging Tests

1. Use `console.log` statements in tests for debugging
2. Run tests in watch mode with `--watch` flag
3. Use VS Code Jest extension for integrated testing
4. Check the Jest documentation for advanced debugging techniques