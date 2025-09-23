'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Icon, IconName } from '../../components/Icon';
import { cn } from '@/lib/utils';

const iconCategories = {
  Navigation: ['menu', 'close', 'home', 'search', 'arrow-right', 'sun', 'moon'] as IconName[],
  Actions: ['add', 'edit', 'delete', 'save'] as IconName[],
  Communication: ['message', 'notification', 'mail'] as IconName[],
  Business: ['wallet', 'analytics', 'projects'] as IconName[],
  Technology: ['ai-brain', 'cpu'] as IconName[],
  Brand: ['logo-icon', 'avatar-placeholder'] as IconName[],
  Utility: ['globe', 'file', 'window'] as IconName[]
};

const sizes = [
  { name: 'Extra Small (16px)', value: 'xs' as const },
  { name: 'Small (20px)', value: 'sm' as const },
  { name: 'Medium (24px)', value: 'md' as const },
  { name: 'Large (32px)', value: 'lg' as const },
  { name: 'Extra Large (48px)', value: 'xl' as const }
];

export default function IconShowcase() {
  const { theme, setTheme } = useTheme();
  const [selectedSize, setSelectedSize] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">MegiLance Icon System</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive collection of professionally designed SVG icons optimized for accessibility, 
            performance, and brand consistency.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center mb-8 p-6 bg-card rounded-lg border">
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium">Theme</label>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="sm" />
              {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium">Size</label>
            <select 
              value={selectedSize} 
              onChange={(e) => setSelectedSize(e.target.value as any)}
              className="px-3 py-2 bg-background border border-border rounded-md"
              title="Select icon size"
              aria-label="Select icon size"
            >
              {sizes.map(size => (
                <option key={size.value} value={size.value}>
                  {size.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Icon Categories */}
        {Object.entries(iconCategories).map(([category, icons]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">{category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {icons.map(iconName => (
                <div 
                  key={iconName}
                  className="flex flex-col items-center gap-3 p-4 bg-card border rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-center h-16 w-16 bg-background rounded-lg border-2 border-dashed border-border">
                    <Icon 
                      name={iconName} 
                      size={selectedSize} 
                      className="text-foreground hover:text-primary transition-colors"
                    />
                  </div>
                  <span className="text-xs font-mono text-center text-muted-foreground">
                    {iconName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Usage Examples */}
        <div className="mt-16 p-8 bg-card rounded-lg border">
          <h2 className="text-2xl font-semibold mb-6">Usage Examples</h2>
          
          <div className="space-y-6">
            {/* Navigation Example */}
            <div>
              <h3 className="text-lg font-medium mb-3">Navigation Bar</h3>
              <div className="flex items-center gap-4 p-4 bg-background rounded-md border">
                <Icon name="logo-icon" size="lg" />
                <div className="flex items-center gap-6 flex-1">
                  <Icon name="home" className="hover:text-primary cursor-pointer" />
                  <Icon name="search" className="hover:text-primary cursor-pointer" />
                  <Icon name="projects" className="hover:text-primary cursor-pointer" />
                  <Icon name="message" className="hover:text-primary cursor-pointer" />
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="notification" className="hover:text-primary cursor-pointer" />
                  <Icon name="avatar-placeholder" size="sm" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-3">Action Buttons</h3>
              <div className="flex flex-wrap gap-3">
                {['add', 'edit', 'delete', 'save'].map(iconName => (
                  <button 
                    key={iconName}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                      iconName === 'add' && "bg-green-600 hover:bg-green-700 text-white",
                      iconName === 'edit' && "bg-blue-600 hover:bg-blue-700 text-white", 
                      iconName === 'delete' && "bg-red-600 hover:bg-red-700 text-white",
                      iconName === 'save' && "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    <Icon name={iconName as IconName} size="sm" />
                    {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Stack Display */}
            <div>
              <h3 className="text-lg font-medium mb-3">Technology Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                  <Icon name="ai-brain" className="text-blue-500" />
                  <div>
                    <div className="font-medium">AI-Powered Matching</div>
                    <div className="text-sm text-muted-foreground">Intelligent job recommendations</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                  <Icon name="analytics" className="text-green-500" />
                  <div>
                    <div className="font-medium">Performance Analytics</div>
                    <div className="text-sm text-muted-foreground">Data-driven insights</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Code */}
        <div className="mt-8 p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Implementation</h3>
          <div className="bg-background p-4 rounded-md border font-mono text-sm">
            <div className="text-muted-foreground">{/* Basic usage */}</div>
            <div>&lt;Icon name=&quot;menu&quot; /&gt;</div>
            <br />
            <div className="text-muted-foreground">{/* With size and styling */}</div>
            <div>&lt;Icon name=&quot;search&quot; size=&quot;lg&quot; className=&quot;text-primary&quot; /&gt;</div>
            <br />
            <div className="text-muted-foreground">{/* With accessibility */}</div>
            <div>&lt;Icon name=&quot;delete&quot; aria-label=&quot;Delete item&quot; /&gt;</div>
          </div>
        </div>
      </div>
    </div>
  );
}