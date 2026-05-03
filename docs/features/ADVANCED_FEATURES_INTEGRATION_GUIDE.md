# Advanced Features Integration Guide

## 🚀 Quick Start: Using Advanced Components

This guide shows you how to integrate the newly created advanced components into MegiLance pages.

---

## 📦 Available Components

### 1. Password Strength Meter
### 2. Advanced Search with Autocomplete
### 3. Real-Time Notifications
### 4. Advanced File Upload
### 5. Analytics Dashboard

---

## 💻 Implementation Examples

### 1. Password Strength Meter

#### Import
```tsx
import { PasswordStrengthMeter } from '@/app/components/AdvancedFeatures';
```

#### Usage in Signup Page
```tsx
// frontend/app/(auth)/signup/Signup.tsx

const [password, setPassword] = useState('');

return (
  <div>
    <Input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter password"
    />
    <PasswordStrengthMeter 
      password={password} 
      showRequirements={true}
    />
  </div>
);
```

#### Props
- `password`: string - The password to analyze
- `showRequirements`: boolean (optional) - Show requirement checklist
- `className`: string (optional) - Additional CSS classes

---

### 2. Advanced Search

#### Import
```tsx
import { AdvancedSearch, SearchResult } from '@/app/components/AdvancedFeatures';
import api from '@/lib/api';
```

#### Usage in Jobs Page
```tsx
// frontend/app/(portal)/freelancer/jobs/page.tsx

const handleSearch = async (query: string): Promise<SearchResult[]> => {
  const response = await api.get('/api/search/advanced/projects', {
    params: { q: query }
  });
  
  return response.data.results.map((job: any) => ({
    id: job.id,
    title: job.title,
    subtitle: `Budget: $${job.budget} | ${job.category}`,
    category: job.category,
    data: job
  }));
};

const handleSelect = (result: SearchResult) => {
  router.push(`/jobs/${result.id}`);
};

return (
  <AdvancedSearch
    placeholder="Search projects..."
    onSearch={handleSearch}
    onSelect={handleSelect}
    debounceMs={300}
    minChars={2}
    showCategories={true}
  />
);
```

#### Props
- `placeholder`: string - Input placeholder text
- `onSearch`: (query: string) => Promise<SearchResult[]> - Search function
- `onSelect`: (result: SearchResult) => void - Handle result selection
- `debounceMs`: number (optional, default: 300) - Debounce delay
- `minChars`: number (optional, default: 2) - Minimum characters to search
- `maxResults`: number (optional, default: 10) - Maximum results to display
- `showCategories`: boolean (optional, default: true) - Group results by category
- `autoFocus`: boolean (optional, default: false) - Auto-focus on mount

---

### 3. Real-Time Notifications

#### Import
```tsx
import { RealTimeNotifications } from '@/app/components/AdvancedFeatures';
```

#### Usage in Layout/Header
```tsx
// frontend/app/(portal)/layout.tsx or Header component

'use client';

import { RealTimeNotifications, Notification } from '@/app/components/AdvancedFeatures';
import { useRouter } from 'next/navigation';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const userId = getUserId(); // Get from auth context
  
  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    // Navigate to relevant page based on notification type
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div>
      <header>
        <nav>
          {/* Other nav items */}
          <RealTimeNotifications
            userId={userId}
            apiBaseUrl={process.env.NEXT_PUBLIC_API_URL}
            onNotificationClick={handleNotificationClick}
            maxDisplayed={5}
            autoMarkAsRead={true}
          />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

#### Props
- `userId`: string - Current user ID (required)
- `apiBaseUrl`: string (optional) - API base URL for WebSocket connection
- `onNotificationClick`: (notification: Notification) => void - Handle notification clicks
- `maxDisplayed`: number (optional, default: 5) - Max notifications in dropdown
- `autoMarkAsRead`: boolean (optional, default: true) - Auto-mark as read on click

---

### 4. Advanced File Upload

#### Import
```tsx
import { AdvancedFileUpload, UploadedFile } from '@/app/components/AdvancedFeatures';
import api from '@/lib/api';
```

#### Usage in Project Creation
```tsx
// frontend/app/(portal)/create-project/page.tsx

const handleFileUpload = async (files: File[]): Promise<{ url: string; id: string }[]> => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  const response = await api.post('/api/projects/upload-attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.files; // [{ id: '1', url: 'https://...' }, ...]
};

const handleFileRemove = (fileId: string) => {
  console.log('File removed:', fileId);
  // Optionally call API to delete file
};

return (
  <div>
    <h3>Project Attachments</h3>
    <AdvancedFileUpload
      maxFiles={10}
      maxSizeMB={10}
      acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx']}
      onUpload={handleFileUpload}
      onRemove={handleFileRemove}
      showPreviews={true}
      multiple={true}
    />
  </div>
);
```

#### Props
- `onUpload`: (files: File[]) => Promise<{ url: string; id: string }[]> - Upload handler
- `onRemove`: (fileId: string) => void (optional) - Remove file handler
- `maxFiles`: number (optional, default: 10) - Maximum number of files
- `maxSizeMB`: number (optional, default: 10) - Maximum file size in MB
- `acceptedTypes`: string[] (optional) - Accepted file types
- `showPreviews`: boolean (optional, default: true) - Show image previews
- `multiple`: boolean (optional, default: true) - Allow multiple files
- `className`: string (optional) - Additional CSS classes

---

### 5. Analytics Dashboard

#### Import
```tsx
import { AnalyticsDashboard, AnalyticsData } from '@/app/components/AdvancedFeatures';
```

#### Usage in Client Dashboard
```tsx
// frontend/app/(portal)/client/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { AnalyticsDashboard, AnalyticsData } from '@/app/components/AdvancedFeatures';
import api from '@/lib/api';

export default function ClientDashboardPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await api.get('/api/analytics/client-dashboard', {
        params: { timeRange }
      });
      
      setAnalyticsData({
        revenue: {
          current: response.data.totalSpent,
          previous: response.data.previousSpent,
          trend: response.data.totalSpent > response.data.previousSpent ? 'up' : 'down',
          chartData: response.data.spendingChart,
        },
        projects: {
          total: response.data.totalProjects,
          active: response.data.activeProjects,
          completed: response.data.completedProjects,
          chartData: response.data.projectsChart,
        },
        users: {
          total: response.data.totalFreelancers,
          active: response.data.activeFreelancers,
          growth: response.data.freelancerGrowth,
          chartData: response.data.freelancersChart,
        },
        performance: {
          responseTime: response.data.avgResponseTime,
          successRate: response.data.projectSuccessRate,
          satisfaction: response.data.avgSatisfaction,
        },
      });
    };

    fetchAnalytics();
  }, [timeRange]);

  if (!analyticsData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Client Dashboard</h1>
      <AnalyticsDashboard
        data={analyticsData}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </div>
  );
}
```

#### Props
- `data`: AnalyticsData - Analytics data to display
- `timeRange`: '7d' | '30d' | '90d' | '1y' (optional, default: '30d')
- `onTimeRangeChange`: (range) => void (optional) - Handle time range change
- `className`: string (optional) - Additional CSS classes

#### AnalyticsData Structure
```typescript
interface AnalyticsData {
  revenue?: {
    current: number;
    previous: number;
    trend: 'up' | 'down';
    chartData: { label: string; value: number }[];
  };
  users?: {
    total: number;
    active: number;
    growth: number;
    chartData: { label: string; value: number }[];
  };
  projects?: {
    total: number;
    active: number;
    completed: number;
    chartData: { label: string; value: number }[];
  };
  performance?: {
    responseTime: number;
    successRate: number;
    satisfaction: number;
  };
}
```

---

## 🎨 Theming

All components follow the 3-file CSS module pattern:
- `.common.module.css` - Shared styles
- `.light.module.css` - Light theme
- `.dark.module.css` - Dark theme

They automatically adapt to the current theme via `useTheme()` from `next-themes`.

---

## 🔗 API Integration Examples

### Search API
```typescript
// GET /api/search/advanced/projects?q=react&category=Web%20Development
{
  "results": [
    {
      "id": 1,
      "title": "React Dashboard Development",
      "budget": 5000,
      "category": "Web Development",
      "skills": ["React", "TypeScript", "TailwindCSS"]
    }
  ],
  "total": 15
}
```

### Upload API
```typescript
// POST /api/projects/upload-attachments
// FormData with files

// Response
{
  "files": [
    { "id": "file_123", "url": "https://storage.../file1.pdf" },
    { "id": "file_124", "url": "https://storage.../file2.jpg" }
  ]
}
```

### Analytics API
```typescript
// GET /api/analytics/client-dashboard?timeRange=30d
{
  "totalSpent": 125000,
  "previousSpent": 110000,
  "totalProjects": 45,
  "activeProjects": 12,
  "completedProjects": 33,
  "totalFreelancers": 28,
  "activeFreelancers": 15,
  "freelancerGrowth": 15,
  "avgResponseTime": 2.5,
  "projectSuccessRate": 94,
  "avgSatisfaction": 4.7,
  "spendingChart": [
    { "label": "Week 1", "value": 28000 },
    { "label": "Week 2", "value": 32000 }
  ]
}
```

---

## 📱 Responsive Design

All components are fully responsive:
- **Desktop**: Full features, optimized layouts
- **Tablet**: Adapted grid systems, touch-friendly
- **Mobile**: Stacked layouts, simplified UI

---

## ♿ Accessibility

All components include:
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ High contrast support

---

## 🧪 Testing

```tsx
// Example test for PasswordStrengthMeter
import { render, screen } from '@testing-library/react';
import { PasswordStrengthMeter } from '@/app/components/AdvancedFeatures';

describe('PasswordStrengthMeter', () => {
  it('shows weak for short password', () => {
    render(<PasswordStrengthMeter password="12345" />);
    expect(screen.getByText(/weak/i)).toBeInTheDocument();
  });

  it('shows excellent for strong password', () => {
    render(<PasswordStrengthMeter password="MyP@ssw0rd123!" />);
    expect(screen.getByText(/excellent/i)).toBeInTheDocument();
  });
});
```

---

## 📚 Next Steps

1. **Integrate components** into existing pages
2. **Create page-specific features** using these as building blocks
3. **Extend components** with additional props/features as needed
4. **Test thoroughly** across all themes and devices
5. **Optimize performance** with code splitting and lazy loading

---

## 🔧 Troubleshooting

### WebSocket connection fails
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend WebSocket endpoint is running
- Verify authentication token is valid

### File upload fails
- Check file size limits (default 10MB)
- Verify accepted file types configuration
- Ensure backend endpoint handles multipart/form-data

### Search not working
- Verify FTS5 tables are created in Turso
- Check search API endpoint is accessible
- Ensure minimum character threshold is met (default: 2)

---

**Created by**: MegiLance Development Team  
**Last Updated**: December 2025  
**Version**: 1.0.0
