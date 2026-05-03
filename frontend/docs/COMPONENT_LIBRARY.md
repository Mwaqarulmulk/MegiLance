with error
<ToggleSwitch 
  label="Accept Terms" 
  checked={accepted} 
  onChange={handleAcceptedChange}
  error="You must accept the terms to continue"
/>
```

### Design Guidelines
- Always provide a clear label
- Show error messages below the toggle
- Use appropriate labels for checked/unchecked states
- Consider using helper text for additional context

## TagsInput

### Overview
The TagsInput component is a themeable and accessible input for managing tags with support for adding, removing, and validating tags.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Label for the tags input |
| `tags` | string[] | [] | Current tags |
| `onChange` | function | - | Change handler |
| `error` | string | - | Error message |
| `disabled` | boolean | false | Whether the tags input is disabled |
| `className` | string | - | Additional CSS classes |
| `id` | string | - | Tags input ID |
| `name` | string | - | Tags input name |
| `placeholder` | string | - | Placeholder text |
| `maxTags` | number | - | Maximum number of tags |
| `validateTag` | function | - | Function to validate tags |

### Usage Examples
```jsx
// Basic tags input
<TagsInput 
  label="Skills" 
  tags={skills} 
  onChange={handleSkillsChange}
  placeholder="Add a skill..."
/>

// Tags input with validation
<TagsInput 
  label="Keywords" 
  tags={keywords} 
  onChange={handleKeywordsChange}
  validateTag={(tag) => tag.length >= 3}
  error="Keywords must be at least 3 characters"
/>
```

### Design Guidelines
- Always provide a clear label
- Show error messages below the tags input
- Use appropriate placeholder text
- Consider implementing tag validation

## Badge

### Overview
The Badge component is a small status indicator with support for different variants and sizes.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Badge content |
| `variant` | 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info' | 'primary' | Visual style variant |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size of the badge |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic badge
<Badge variant="success">Completed</Badge>

// Small badge
<Badge size="sm" variant="warning">In Progress</Badge>

// Large badge
<Badge size="lg" variant="danger">Urgent</Badge>
```

### Design Guidelines
- Use badges for status indicators
- Choose appropriate variants based on meaning
- Keep content concise
- Use consistent sizing within a section

## Alert

### Overview
The Alert component is used to display important messages to the user with support for different variants and actions.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Alert content |
| `variant` | 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info' | 'info' | Visual style variant |
| `title` | string | - | Alert title |
| `actions` | ReactNode | - | Action buttons |
| `onClose` | function | - | Close handler |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic alert
<Alert variant="info" title="Information">
  This is an informational message.
</Alert>

// Alert with actions
<Alert 
  variant="warning" 
  title="Warning"
  actions={
    <>
      <Button variant="secondary" size="sm">Cancel</Button>
      <Button variant="warning" size="sm">Proceed</Button>
    </>
  }
>
  This action cannot be undone.
</Alert>

// Dismissible alert
<Alert 
  variant="success" 
  title="Success"
  onClose={handleClose}
>
  Your changes have been saved.
</Alert>
```

### Design Guidelines
- Use appropriate variants based on message type
- Include clear titles for important messages
- Provide actionable buttons when appropriate
- Allow dismissal for non-critical messages

## Modal

### Overview
The Modal component is used to display content in an overlay that requires user interaction.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | - | Whether the modal is open |
| `onClose` | function | - | Close handler |
| `title` | string | - | Modal title |
| `children` | ReactNode | - | Modal content |
| `actions` | ReactNode | - | Action buttons |
| `size` | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Size of the modal |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic modal
<Modal 
  isOpen={isModalOpen} 
  onClose={handleModalClose}
  title="Confirm Action"
  actions={
    <>
      <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed with this action?</p>
</Modal>

// Large modal
<Modal 
  isOpen={isLargeModalOpen} 
  onClose={handleLargeModalClose}
  title="Detailed Information"
  size="lg"
>
  {/* Detailed content */}
</Modal>
```

### Design Guidelines
- Use modals for important actions requiring confirmation
- Include clear titles and actionable buttons
- Keep content focused and concise
- Provide clear exit paths

## Toast

### Overview
The Toast component is used to display brief, non-modal messages to the user.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Toast title |
| `description` | string | - | Toast description |
| `variant` | 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info' | 'info' | Visual style variant |
| `duration` | number | 5000 | Duration in milliseconds before auto-dismiss |
| `onDismiss` | function | - | Dismiss handler |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic toast
<Toast 
  title="Success"
  description="Your changes have been saved."
  variant="success"
/>

// Toast with custom duration
<Toast 
  title="Information"
  description="This message will disappear in 10 seconds."
  duration={10000}
  variant="info"
/>
```

### Design Guidelines
- Use toasts for non-critical feedback
- Keep messages brief and actionable
- Use appropriate variants based on message type
- Consider duration based on message importance

## Tooltip

### Overview
The Tooltip component is used to display additional information when hovering or focusing on an element.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Element to attach tooltip to |
| `content` | ReactNode | - | Tooltip content |
| `position` | 'top' \| 'right' \| 'bottom' \| 'left' | 'top' | Tooltip position |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic tooltip
<Tooltip content="This is helpful information">
  <Button variant="secondary" iconBefore={<Info size={16} />}>Info</Button>
</Tooltip>

// Tooltip with custom position
<Tooltip content="Additional details" position="right">
  <span>Hover me</span>
</Tooltip>
```

### Design Guidelines
- Use for supplementary information
- Keep content concise
- Position appropriately based on available space
- Ensure accessibility with proper ARIA attributes

## Dropdown

### Overview
The Dropdown component is used to display a list of options in a collapsible menu.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | ReactNode | - | Element to trigger the dropdown |
| `children` | ReactNode | - | Dropdown content |
| `position` | 'top' \| 'right' \| 'bottom' \| 'left' | 'bottom' | Dropdown position |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic dropdown
<Dropdown 
  trigger={<Button variant="secondary">Options</Button>}
>
  <div className="dropdown-menu">
    <button>Option 1</button>
    <button>Option 2</button>
    <button>Option 3</button>
  </div>
</Dropdown>

// Dropdown with custom position
<Dropdown 
  trigger={<Button variant="secondary" iconBefore={<MoreVertical size={16} />}>More</Button>}
  position="right"
>
  <div className="dropdown-menu">
    <button>Edit</button>
    <button>Delete</button>
  </div>
</Dropdown>
```

### Design Guidelines
- Use for grouped actions or options
- Position appropriately based on available space
- Include clear visual indicators for the trigger
- Ensure keyboard accessibility

## Tabs

### Overview
The Tabs component is used to organize content into separate views where only one view is visible at a time.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | Array<{ id: string, label: string, content: ReactNode }> | [] | Tab definitions |
| `activeTab` | string | - | Active tab ID |
| `onChange` | function | - | Change handler |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic tabs
<Tabs 
  tabs={[
    { id: 'overview', label: 'Overview', content: <OverviewContent /> },
    { id: 'details', label: 'Details', content: <DetailsContent /> },
    { id: 'settings', label: 'Settings', content: <SettingsContent /> }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### Design Guidelines
- Use tabs to organize related content
- Keep tab labels concise and descriptive
- Ensure content in each tab is distinct
- Maintain consistent styling across tabs

## Accordion

### Overview
The Accordion component is used to display collapsible content sections.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array<{ id: string, title: string, content: ReactNode }> | [] | Accordion items |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic accordion
<Accordion 
  items={[
    { id: 'item1', title: 'Section 1', content: <Section1Content /> },
    { id: 'item2', title: 'Section 2', content: <Section2Content /> },
    { id: 'item3', title: 'Section 3', content: <Section3Content /> }
  ]}
/>
```

### Design Guidelines
- Use accordions to organize lengthy content
- Keep section titles clear and descriptive
- Ensure content within sections is related
- Consider default open states for important content

## Pagination

### Overview
The Pagination component is used to navigate between pages of content.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | number | - | Current page number |
| `totalPages` | number | - | Total number of pages |
| `onPageChange` | function | - | Page change handler |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic pagination
<Pagination 
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>
```

### Design Guidelines
- Use for content that spans multiple pages
- Include previous/next navigation
- Show current page position
- Consider ellipsis for large page counts

## Table

### Overview
The Table component is used to display tabular data with support for sorting and pagination.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | Array<{ key: string, title: string, sortable?: boolean }> | [] | Table columns |
| `data` | any[] | [] | Table data |
| `onSort` | function | - | Sort handler |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic table
<Table 
  columns={[
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role', sortable: true }
  ]}
  data={userData}
  onSort={handleSort}
/>
```

### Design Guidelines
- Use for structured data presentation
- Include sorting for relevant columns
- Maintain consistent row heights
- Consider responsive behavior for small screens

## ProgressBar

### Overview
The ProgressBar component is used to display the progress of a task or process.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | - | Current progress value (0-100) |
| `max` | number | 100 | Maximum value |
| `label` | string | - | Progress label |
| `variant` | 'primary' \| 'success' \| 'warning' \| 'danger' | 'primary' | Visual style variant |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic progress bar
<ProgressBar value={75} label="Task Completion" />

// Success variant
<ProgressBar value={100} variant="success" label="Completed" />
```

### Design Guidelines
- Use to show task completion status
- Include clear labels
- Choose appropriate variants based on status
- Consider animated transitions for updates

## StarRating

### Overview
The StarRating component is used to display and collect star ratings.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rating` | number | - | Current rating (0-5) |
| `onRate` | function | - | Rating change handler |
| `readOnly` | boolean | false | Whether the rating is read-only |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Interactive star rating
<StarRating rating={rating} onRate={setRating} />

// Read-only star rating
<StarRating rating={4.5} readOnly />
```

### Design Guidelines
- Use for collecting or displaying ratings
- Provide clear visual feedback
- Consider half-star ratings for precision
- Ensure accessibility with proper labels

## DatePicker

### Overview
The DatePicker component is used to select dates with support for date ranges, presets, and time selection.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Label for the date picker |
| `value` | Date \| null | null | Selected date |
| `onChange` | function | - | Change handler |
| `placeholder` | string | 'Select date' | Placeholder text |
| `error` | string | - | Error message |
| `disabled` | boolean | false | Whether the date picker is disabled |
| `required` | boolean | false | Whether the date picker is required |
| `className` | string | - | Additional CSS classes |
| `wrapperClassName` | string | - | Additional wrapper CSS classes |
| `minDate` | Date | - | Minimum selectable date |
| `maxDate` | Date | - | Maximum selectable date |
| `showTimeSelect` | boolean | false | Whether to show time selection |
| `dateFormat` | string | 'MMM d, yyyy' | Date format string |
| `timeFormat` | string | 'h:mm aa' | Time format string |
| `showPresets` | boolean | false | Whether to show date presets |
| `presets` | Array<{ label: string, date: Date }> | [] | Date presets |
| `fullWidth` | boolean | false | Whether to take full width |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size of the date picker |

### Usage Examples
```jsx
// Basic date picker
<DatePicker 
  label="Birth Date" 
  value={birthDate} 
  onChange={setBirthDate}
  placeholder="Select your birth date"
/>

// Date picker with time selection
<DatePicker 
  label="Appointment" 
  value={appointmentDate} 
  onChange={setAppointmentDate}
  showTimeSelect
  minDate={new Date()}
  placeholder="Select appointment date and time"
/>

// Date picker with presets
<DatePicker 
  label="Project Deadline" 
  value={deadline} 
  onChange={setDeadline}
  showPresets
  presets={[
    { label: 'Tomorrow', date: new Date(Date.now() + 86400000) },
    { label: 'Next Week', date: new Date(Date.now() + 604800000) },
    { label: 'Next Month', date: new Date(Date.now() + 2592000000) }
  ]}
  placeholder="Select deadline"
/>
```

### Design Guidelines
- Always provide a clear label
- Show error messages below the date picker
- Use appropriate min/max dates for validation
- Consider using presets for common date selections
- Implement proper keyboard navigation
- Ensure accessibility with proper ARIA attributes

## PieChart

### Overview
The PieChart component is used to display data in a circular chart format with support for tooltips, legends, and interactive elements.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array<{ label: string, value: number, color?: string }> | - | Chart data |
| `title` | string | - | Chart title |
| `showLegend` | boolean | true | Whether to show the legend |
| `showTooltip` | boolean | true | Whether to show tooltips |
| `showPercentage` | boolean | true | Whether to show percentages on slices |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size of the chart |
| `className` | string | - | Additional CSS classes |
| `wrapperClassName` | string | - | Additional wrapper CSS classes |

### Usage Examples
```jsx
// Basic pie chart
<PieChart 
  title="Revenue by Category"
  data={[
    { label: 'Services', value: 45000 },
    { label: 'Products', value: 30000 },
    { label: 'Consulting', value: 15000 },
    { label: 'Support', value: 10000 }
  ]}
/>

// Pie chart with custom colors
<PieChart 
  title="User Distribution"
  showLegend={false}
  data={[
    { label: 'Active', value: 750, color: '#4CAF50' },
    { label: 'Inactive', value: 250, color: '#F44336' }
  ]}
/>

// Large pie chart with tooltips
<PieChart 
  title="Market Share"
  size="lg"
  data={[
    { label: 'Company A', value: 35 },
    { label: 'Company B', value: 25 },
    { label: 'Company C', value: 20 },
    { label: 'Company D', value: 15 },
    { label: 'Others', value: 5 }
  ]}
/>
```

### Design Guidelines
- Use for showing proportional data
- Limit the number of slices for clarity (5-7 max)
- Use contrasting colors for different slices
- Include a legend for better understanding
- Show percentages when values are meaningful
- Implement tooltips for detailed information
- Ensure accessibility with proper ARIA attributes

## UserAvatar

### Overview
The UserAvatar component is used to display user profile images or initials.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | - | Image source URL |
| `name` | string | - | User name for initials |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Avatar size |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Avatar with image
<UserAvatar src="/profile.jpg" name="John Doe" />

// Avatar with initials
<UserAvatar name="Jane Smith" size="lg" />
```

### Design Guidelines
- Use to represent users visually
- Include fallback initials for missing images
- Maintain consistent sizing within contexts
- Consider online status indicators

## ProjectCard

### Overview
The ProjectCard component is used to display project information in a card format.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Project title |
| `description` | string | - | Project description |
| `status` | string | - | Project status |
| `budget` | number | - | Project budget |
| `progress` | number | - | Project progress (0-100) |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic project card
<ProjectCard 
  title="Website Redesign"
  description="Complete redesign of company website"
  status="In Progress"
  budget={5000}
  progress={65}
/>
```

### Design Guidelines
- Use to display project summaries
- Include key project metrics
- Show status clearly
- Maintain consistent styling with other cards

## DashboardWidget

### Overview
The DashboardWidget component is used to display key metrics and data visualizations on dashboards.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Widget title |
| `value` | string \| number | - | Main value |
| `trend` | string | - | Trend information |
| `icon` | ReactNode | - | Icon component |
| `chart` | ReactNode | - | Chart component |
| `className` | string | - | Additional CSS classes |

### Usage Examples
```jsx
// Basic dashboard widget
<DashboardWidget 
  title="Total Revenue"
  value="$12,450"
  trend="+12%"
  icon={<DollarSign size={24} />}
/>

// Widget with chart
<DashboardWidget 
  title="Active Users"
  value="1,248"
  trend="+5%"
  icon={<Users size={24} />}
  chart={<ActivityChart />}
/>
```

### Design Guidelines
- Use to display key metrics on dashboards
- Include trend information when relevant
- Use appropriate icons for quick recognition
- Consider data visualization for complex metrics

## Component Development Guidelines

### CSS Module Structure
All components should follow the per-component CSS module structure:

1. `Component.common.module.css` - Theme-agnostic styles
2. `Component.light.module.css` - Light theme styles
3. `Component.dark.module.css` - Dark theme styles
4. `Component.tsx` - Component implementation

### Accessibility
- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation support
- Maintain color contrast ratios
- Provide focus indicators

### Performance
- Use React.memo for expensive components
- Implement virtualization for large lists
- Optimize images and assets
- Use code splitting for non-critical components

### Responsive Design
- Design mobile-first
- Use flexible layouts
- Optimize touch targets
- Test across device sizes

### Testing
- Write unit tests for components
- Include snapshot tests
- Test accessibility features
- Verify responsive behavior

## Component Status

| Component | Status | Notes |
|----------|--------|-------|
| Button | ✅ Complete | Fully implemented with all variants |
| Input | ✅ Complete | Supports all input types |
| Textarea | ✅ Complete | Includes character counting |
| Checkbox | ✅ Complete | Supports indeterminate state |
| Card | ✅ Complete | Multiple variants available |
| Select | ✅ Complete | Accessible dropdown component |
| RadioGroup | ✅ Complete | Horizontal and vertical layouts |
| ToggleSwitch | ✅ Complete | Accessible toggle component |
| TagsInput | ✅ Complete | Supports validation |
| Badge | ✅ Complete | Multiple variants |
| Alert | ✅ Complete | Dismissible with actions |
| Modal | ✅ Complete | Focus trapping implemented |
| Toast | ✅ Complete | Auto-dismiss with manual control |
| Tooltip | ✅ Complete | Positioning options |
| Dropdown | ✅ Complete | Keyboard accessible |
| Tabs | ✅ Complete | Keyboard navigation |
| Accordion | ✅ Complete | Smooth animations |
| Pagination | ✅ Complete | Ellipsis for large pages |
| Table | ✅ Complete | Sorting support |
| ProgressBar | ✅ Complete | Multiple variants |
| StarRating | ✅ Complete | Half-star support |
| UserAvatar | ✅ Complete | Initials fallback |
| ProjectCard | ✅ Complete | Progress visualization |
| DashboardWidget | ✅ Complete | Trend indicators |
| DatePicker | ✅ Complete | Date selection with presets |
| PieChart | ✅ Complete | Data visualization with tooltips |

## Future Enhancements

### Planned Components
1. TimePicker - For time selection
2. FileUpload - For file uploading with preview
3. RichTextEditor - For rich text editing
4. Wizard - Multi-step process component
5. Skeleton - Loading placeholders
6. Popover - Contextual overlays

### Component Improvements
1. Enhanced animation system
2. Improved accessibility features
3. Better mobile touch interactions
4. Advanced theming options
5. Performance optimizations
6. Extended customization props
7. Better TypeScript support
8. Comprehensive testing suite

## Conclusion

The MegiLance Component Library provides a comprehensive set of reusable, accessible, and theme-aware components that follow modern design principles and 2025 UI/UX trends. Each component is carefully designed and implemented to ensure consistency, maintainability, and excellent user experience across the platform.