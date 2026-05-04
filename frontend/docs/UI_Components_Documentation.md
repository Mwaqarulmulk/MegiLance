# UI Components Documentation

This document provides comprehensive documentation for all UI components in the MegiLance platform, including their usage, props, and design guidelines.

## Table of Contents
1. [Button Component](#button-component)
2. [Input Component](#input-component)
3. [Textarea Component](#textarea-component)
4. [Checkbox Component](#checkbox-component)
5. [Card Component](#card-component)

## Button Component

### Overview
The Button component is a versatile and reusable button element that supports multiple variants, sizes, and states. It is fully theme-aware and adapts its styles based on the global theme context.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Content to be displayed inside the button |
| `variant` | 'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success' | 'primary' | Visual style variant |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | Size of the button |
| `fullWidth` | boolean | false | Whether the button should take full width |
| `loading` | boolean | false | Whether to show loading state |
| `disabled` | boolean | false | Whether the button is disabled |
| `as` | 'button' \| 'a' | 'button' | HTML element to render as |
| `href` | string | - | URL for link buttons |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Primary button
<Button variant="primary">Click Me</Button>

// Secondary button with icon
<Button variant="secondary" size="large">
  <Settings size={18} />
  Settings
</Button>

// Full width loading button
<Button fullWidth loading>Submitting...</Button>

// Link button
<Button as="a" href="/dashboard" variant="ghost">Go to Dashboard</Button>
```

### Design Guidelines
- Use primary buttons for main actions
- Use secondary buttons for secondary actions
- Use ghost buttons for less important actions
- Maintain consistent sizing within a section
- Always provide accessible labels for icon-only buttons

## Input Component

### Overview
The Input component is a themeable and accessible form input element with support for labels, error states, and various input types.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Label for the input |
| `type` | string | 'text' | Input type (text, email, password, etc.) |
| `placeholder` | string | - | Placeholder text |
| `value` | string | - | Input value |
| `onChange` | function | - | Change handler |
| `error` | string | - | Error message |
| `required` | boolean | false | Whether the field is required |
| `disabled` | boolean | false | Whether the input is disabled |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic input with label
<Input label="Email Address" type="email" placeholder="you@example.com" />

// Input with error state
<Input 
  label="Password" 
  type="password" 
  error="Password must be at least 8 characters" 
/>

// Required input
<Input label="Full Name" required />
```

### Design Guidelines
- Always provide clear labels
- Use appropriate input types for better UX
- Show error messages below the input
- Use placeholders as hints, not replacements for labels

## Textarea Component

### Overview
The Textarea component is a themeable and accessible multi-line text input with support for labels, error states, and character counting.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Label for the textarea |
| `placeholder` | string | - | Placeholder text |
| `value` | string | - | Textarea value |
| `onChange` | function | - | Change handler |
| `error` | string | - | Error message |
| `required` | boolean | false | Whether the field is required |
| `disabled` | boolean | false | Whether the textarea is disabled |
| `rows` | number | 5 | Number of visible text lines |
| `maxLength` | number | - | Maximum character limit |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic textarea
<Textarea label="Message" placeholder="Enter your message..." />

// Textarea with character limit
<Textarea 
  label="Bio" 
  maxLength={200} 
  placeholder="Tell us about yourself..."
/>

// Required textarea with error
<Textarea 
  label="Feedback" 
  required 
  error="This field is required"
/>
```

### Design Guidelines
- Set appropriate row counts based on expected content length
- Use character limits for concise fields
- Always provide clear labels
- Show error messages below the textarea

## Checkbox Component

### Overview
The Checkbox component is a themeable and accessible checkbox input with support for labels, error states, and indeterminate states.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | - | Unique identifier |
| `name` | string | - | Name attribute |
| `checked` | boolean | - | Whether the checkbox is checked |
| `onChange` | function | - | Change handler |
| `children` | ReactNode | - | Label content |
| `error` | string | - | Error message |
| `disabled` | boolean | false | Whether the checkbox is disabled |
| `indeterminate` | boolean | false | Whether to show indeterminate state |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic checkbox
<Checkbox name="terms" checked={agreed} onChange={handleAgree}>
  I agree to the terms and conditions
</Checkbox>

// Checkbox with error
<Checkbox 
  name="newsletter" 
  checked={subscribed} 
  onChange={handleSubscribe}
  error="You must subscribe to continue"
>
  Subscribe to our newsletter
</Checkbox>

// Indeterminate checkbox
<Checkbox 
  name="selectAll" 
  checked={allSelected} 
  indeterminate={someSelected}
  onChange={handleSelectAll}
>
  Select all items
</Checkbox>
```

### Design Guidelines
- Always provide descriptive labels
- Use indeterminate state for partial selections
- Group related checkboxes logically
- Show error messages below the checkbox

## Card Component

### Overview
The Card component is a versatile container for content sections with support for headers, icons, and multiple variants. It is fully theme-aware and adapts its styles based on the global theme context.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Card title |
| `icon` | React.ElementType | - | Icon component |
| `children` | ReactNode | - | Card content |
| `className` | string | - | Additional CSS classes |
| `variant` | 'default' \| 'elevated' \| 'outline' \| 'filled' | 'default' | Visual style variant |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size of the card |
| `loading` | boolean | false | Whether to show loading state |

### Usage Examples
```jsx
// Basic card
<Card title="Project Overview">
  <p>This project involves developing a modern web application...</p>
</Card>

// Card with icon
<Card title="Analytics" icon={BarChart}>
  <div className="stats-grid">
    {/* Stats content */}
  </div>
</Card>

// Elevated variant
<Card variant="elevated" title="Important Notice">
  <p>Please review the updated terms of service.</p>
</Card>

// Loading card
<Card title="Processing" loading>
  <p>Your request is being processed...</p>
</Card>
```

### Design Guidelines
- Use cards to group related content
- Choose appropriate variants based on content hierarchy
- Include icons for visual recognition
- Use loading states for async operations
- Maintain consistent padding and spacing

## Design System

### Color Palette
- Primary: #4573df (MegiLance Blue)
- Secondary: #ff9800 (Orange)
- Success: #4caf50 (Green)
- Warning: #f2c94c (Yellow)
- Danger: #e81123 (Red)
- Background Light: #ffffff
- Background Dark: #0b1020
- Text Primary: #0f172a (Light) / #f5f7fa (Dark)
- Text Secondary: #4b5563 (Light) / #9ca3af (Dark)

### Typography
- Primary Font: Poppins (Headings)
- Secondary Font: Inter (Body)
- Font Sizes:
  - Small: 0.875rem
  - Base: 1rem
  - Large: 1.125rem
  - XL: 1.25rem
  - 2XL: 1.5rem
  - 3XL: 1.875rem
  - 4XL: 2.25rem

### Spacing
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 10: 2.5rem (40px)
- 12: 3rem (48px)
- 16: 4rem (64px)

### Border Radius
- Small: 6px
- Medium: 8px
- Large: 12px
- XL: 16px
- 2XL: 24px
- 3XL: 32px
- Full: 9999px

### Shadows
- Small: 0 1px 2px rgba(0,0,0,0.05)
- Medium: 0 4px 6px rgba(0,0,0,0.1)
- Large: 0 10px 15px rgba(0,0,0,0.1)
- XL: 0 20px 25px rgba(0,0,0,0.15)

## Accessibility Guidelines

### General Principles
1. All interactive elements must be focusable
2. Color should not be the only means of conveying information
3. All images must have appropriate alt text
4. Form elements must have associated labels
5. Keyboard navigation must be fully supported

### ARIA Attributes
- Use `aria-label` for icon-only buttons
- Use `aria-describedby` for error messages
- Use `aria-invalid` for form validation
- Use `aria-expanded` for collapsible elements
- Use `aria-hidden` for decorative elements

### Focus Management
- Provide visible focus indicators
- Maintain logical tab order
- Trap focus in modals and dialogs
- Return focus after closing overlays
- Use `:focus-visible` for enhanced focus styles

## Responsive Design

### Breakpoints
- Small: 480px
- Medium: 768px
- Large: 992px
- XL: 1200px
- 2XL: 1400px

### Mobile-First Approach
1. Design for mobile first
2. Enhance for larger screens
3. Use flexible grids and layouts
4. Optimize touch targets (minimum 44px)
5. Consider orientation changes

### Performance Optimization
1. Lazy load non-critical components
2. Optimize images and assets
3. Minimize CSS bundle size
4. Use CSS containment where appropriate
5. Implement proper caching strategies