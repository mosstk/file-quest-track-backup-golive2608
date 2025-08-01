# Developer Guide - Document Request Management System

## Table of Contents
1. [Quick Start](#quick-start)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Component Development](#component-development)
6. [State Management](#state-management)
7. [Database Development](#database-development)
8. [API Development](#api-development)
9. [Testing Guidelines](#testing-guidelines)
10. [Performance Guidelines](#performance-guidelines)
11. [Security Guidelines](#security-guidelines)
12. [Deployment Guide](#deployment-guide)
13. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites
```bash
# Required software
Node.js >= 18.0.0
Bun >= 1.0.0 (recommended) or npm/yarn
Git
Visual Studio Code (recommended)

# Recommended VS Code extensions
- TypeScript Importer
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
```

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd document-request-system

# Install dependencies
bun install
# or npm install

# Set up environment variables
cp .env.example .env.local

# Fill in your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
bun dev
# or npm run dev
```

### First Contribution
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code changes ...

# Run tests and linting
bun run lint
bun run type-check

# Commit your changes
git add .
git commit -m "feat: add your feature description"

# Push and create pull request
git push origin feature/your-feature-name
```

## Development Environment

### Recommended Setup

#### VS Code Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

#### Extensions Configuration
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Project Structure

### Directory Organization
```
src/
├── components/              # Reusable components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── ApprovalForm.tsx    # Feature-specific components
│   ├── FileRequestForm.tsx
│   └── ...
├── pages/                  # Page components
│   ├── AdminDashboard.tsx
│   ├── RequesterDashboard.tsx
│   └── ...
├── hooks/                  # Custom React hooks
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── ...
├── lib/                    # Utility functions and configurations
│   ├── utils.ts           # General utilities
│   └── utils/             # Specific utility modules
│       ├── auth-helpers.ts
│       ├── formatters.ts
│       └── ...
├── context/               # React context providers
│   ├── AuthContext.tsx
│   └── ...
├── integrations/          # External service integrations
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── types/                 # TypeScript type definitions
│   ├── index.ts
│   └── supabase.ts
├── index.css             # Global styles and Tailwind imports
└── main.tsx              # Application entry point
```

### File Naming Conventions
```typescript
// Components: PascalCase
UserProfile.tsx
RequestTable.tsx

// Hooks: camelCase with 'use' prefix
useAuth.ts
useRequests.ts

// Utilities: camelCase
formatters.ts
authHelpers.ts

// Types: camelCase for files, PascalCase for interfaces
// types/index.ts
export interface FileRequest { ... }
export type RequestStatus = 'pending' | 'approved';

// Constants: UPPER_SNAKE_CASE
const API_ENDPOINTS = { ... };
const REQUEST_STATUSES = { ... };
```

## Development Workflow

### Git Workflow
```bash
# Main development branch
main

# Feature development
feature/feature-name
feature/add-user-management
feature/improve-dashboard

# Bug fixes
fix/bug-description
fix/login-redirect-issue

# Hotfixes
hotfix/critical-bug-fix

# Release preparation
release/v1.2.0
```

### Commit Message Convention
```bash
# Format: type(scope): description

# Types
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc.)
refactor: # Code refactoring
test:     # Adding or modifying tests
chore:    # Maintenance tasks

# Examples
feat(auth): add password reset functionality
fix(dashboard): resolve data loading issue
docs(readme): update installation instructions
refactor(components): extract common button variants
```

### Code Review Checklist
- [ ] Code follows TypeScript best practices
- [ ] Components are properly typed
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Accessibility standards are met
- [ ] Mobile responsiveness is maintained
- [ ] Performance considerations are addressed
- [ ] Security implications are considered
- [ ] Tests are written for new functionality
- [ ] Documentation is updated

## Component Development

### Component Architecture

#### Base Component Template
```typescript
// components/ExampleComponent.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const ExampleComponent = React.forwardRef<
  HTMLDivElement,
  ExampleComponentProps
>(({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className,
  onClick,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        // Base styles
        'flex items-center justify-center rounded-md font-medium',
        // Variant styles
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-destructive text-destructive-foreground': variant === 'destructive',
        },
        // Size styles
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

ExampleComponent.displayName = 'ExampleComponent';

export { ExampleComponent };
export type { ExampleComponentProps };
```

#### Form Component Pattern
```typescript
// components/ExampleForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type FormData = z.infer<typeof formSchema>;

interface ExampleFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  defaultValues?: Partial<FormData>;
  isLoading?: boolean;
}

const ExampleForm: React.FC<ExampleFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading = false,
}) => {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Success',
        description: 'Form submitted successfully',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit form',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
};

export { ExampleForm };
```

### Custom Hooks Pattern

#### Data Fetching Hook
```typescript
// hooks/useRequests.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileRequest } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch requests
  const {
    data: requests = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_requests');
      if (error) throw error;
      return data as FileRequest[];
    },
  });

  // Create request mutation
  const createRequest = useMutation({
    mutationFn: async (requestData: Partial<FileRequest>) => {
      const { data, error } = await supabase.rpc('create_request', requestData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'Success',
        description: 'Request created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create request',
        variant: 'destructive',
      });
    },
  });

  // Update request mutation
  const updateRequest = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FileRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  return {
    requests,
    isLoading,
    error,
    refetch,
    createRequest: createRequest.mutate,
    updateRequest: updateRequest.mutate,
    isCreating: createRequest.isPending,
    isUpdating: updateRequest.isPending,
  };
};
```

#### Authentication Hook
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'fa_admin',
    isRequester: profile?.role === 'requester',
    isReceiver: profile?.role === 'receiver',
  };
};
```

## State Management

### Context Pattern
```typescript
// context/AppContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
}

type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: AppState = {
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

### React Query Setup
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});
```

## Database Development

### Supabase Integration

#### Client Setup
```typescript
// integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

#### Database Utilities
```typescript
// lib/utils/database.ts
import { supabase } from '@/integrations/supabase/client';
import { FileRequest, Profile } from '@/types';

export class DatabaseError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const handleSupabaseError = (error: any): never => {
  console.error('Supabase error:', error);
  throw new DatabaseError(
    error.message || 'Database operation failed',
    error
  );
};

export const withErrorHandling = async <T>(
  operation: () => Promise<{ data: T; error: any }>
): Promise<T> => {
  const { data, error } = await operation();
  if (error) {
    handleSupabaseError(error);
  }
  return data;
};

// Example usage
export const createRequest = async (requestData: Partial<FileRequest>) => {
  return withErrorHandling(() =>
    supabase.rpc('create_request', requestData)
  );
};

export const getRequestById = async (id: string) => {
  return withErrorHandling(() =>
    supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single()
  );
};
```

#### Real-time Subscriptions
```typescript
// hooks/useRealtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealtime = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          // Invalidate requests query to refetch data
          queryClient.invalidateQueries({ queryKey: ['requests'] });
          
          // Show notification for relevant changes
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Request',
              description: 'A new request has been created',
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: 'Request Updated',
              description: 'A request status has been updated',
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
};
```

### Database Migrations

#### Migration Template
```sql
-- Migration: add_new_feature.sql
-- Description: Add new feature to the system

-- Create new table
CREATE TABLE IF NOT EXISTS new_feature (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own features" ON new_feature
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own features" ON new_feature
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_new_feature_user_id ON new_feature(user_id);
CREATE INDEX idx_new_feature_created_at ON new_feature(created_at DESC);

-- Create function
CREATE OR REPLACE FUNCTION get_user_features(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nf.id,
    nf.name,
    nf.description,
    nf.created_at
  FROM new_feature nf
  WHERE nf.user_id = user_uuid
  ORDER BY nf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_new_feature_updated_at
  BEFORE UPDATE ON new_feature
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## API Development

### Edge Functions

#### Function Template
```typescript
// supabase/functions/example-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: string;
  data: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Parse request body
    const body: RequestBody = await req.json();

    // Handle different actions
    let result;
    switch (body.action) {
      case 'example_action':
        result = await handleExampleAction(supabase, user, body.data);
        break;
      default:
        throw new Error(`Unknown action: ${body.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function handleExampleAction(supabase: any, user: any, data: any) {
  // Implement your business logic here
  console.log('Handling example action for user:', user.id);
  console.log('Data:', data);

  // Example database operation
  const { data: result, error } = await supabase
    .from('some_table')
    .insert({ user_id: user.id, ...data })
    .select()
    .single();

  if (error) throw error;
  return result;
}
```

### API Client Utilities
```typescript
// lib/api.ts
import { supabase } from '@/integrations/supabase/client';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = {
  async call<T = any>(
    functionName: string,
    data: Record<string, any> = {}
  ): Promise<T> {
    const { data: result, error } = await supabase.functions.invoke(
      functionName,
      {
        body: data,
      }
    );

    if (error) {
      throw new ApiError(error.message, error.status, error.code);
    }

    if (!result.success) {
      throw new ApiError(result.error || 'API call failed');
    }

    return result.data;
  },

  async rpc<T = any>(
    functionName: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    const { data, error } = await supabase.rpc(functionName, params);

    if (error) {
      throw new ApiError(error.message, error.code);
    }

    return data;
  },
};

// Usage examples
export const requestsApi = {
  getAll: () => apiClient.rpc('get_all_requests'),
  create: (data: any) => apiClient.rpc('create_request', data),
  approve: (id: string, data: any) => 
    apiClient.rpc('approve_request', { p_request_id: id, ...data }),
  confirmDelivery: (id: string, receiverId: string) =>
    apiClient.rpc('confirm_delivery', { 
      p_request_id: id, 
      p_receiver_id: receiverId 
    }),
};

export const notificationApi = {
  send: (data: any) => apiClient.call('send-request-notification', data),
};
```

## Testing Guidelines

### Test Setup
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### Component Testing
```typescript
// components/__tests__/ExampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExampleComponent } from '../ExampleComponent';

describe('ExampleComponent', () => {
  it('renders children correctly', () => {
    render(<ExampleComponent>Test Content</ExampleComponent>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    render(
      <ExampleComponent variant="destructive">
        Destructive Button
      </ExampleComponent>
    );
    
    const element = screen.getByText('Destructive Button');
    expect(element).toHaveClass('bg-destructive');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(
      <ExampleComponent onClick={handleClick}>
        Click Me
      </ExampleComponent>
    );
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<ExampleComponent ref={ref}>Content</ExampleComponent>);
    expect(ref).toHaveBeenCalled();
  });
});
```

### Hook Testing
```typescript
// hooks/__tests__/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../useAuth';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('handles successful authentication', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockProfile = { 
      id: '456', 
      user_id: '123', 
      role: 'requester',
      name: 'Test User'
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isRequester).toBe(true);
  });
});
```

### Integration Testing
```typescript
// src/test/integration/auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Authentication Integration', () => {
  it('allows user to login successfully', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    });

    render(<LoginPage />, { wrapper: TestWrapper });

    // Fill in login form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for success
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

## Performance Guidelines

### Code Splitting
```typescript
// Lazy load components
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const RequesterDashboard = lazy(() => import('@/pages/RequesterDashboard'));

// Usage in router
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### Memoization
```typescript
// Memoize expensive components
import { memo, useMemo, useCallback } from 'react';

interface ExpensiveComponentProps {
  data: ComplexData[];
  onItemClick: (id: string) => void;
}

const ExpensiveComponent = memo<ExpensiveComponentProps>(({ 
  data, 
  onItemClick 
}) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computedValue: expensiveCalculation(item),
    }));
  }, [data]);

  // Memoize event handlers
  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <div>
      {processedData.map(item => (
        <Item 
          key={item.id} 
          data={item} 
          onClick={handleClick}
        />
      ))}
    </div>
  );
});
```

### Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
});
```

## Security Guidelines

### Input Validation
```typescript
// Always validate inputs with Zod
import { z } from 'zod';

const createRequestSchema = z.object({
  document_name: z.string().min(1).max(255),
  receiver_email: z.string().email(),
  notes: z.string().max(1000).optional(),
});

// Validate before API calls
const validateAndCreateRequest = async (data: unknown) => {
  const validatedData = createRequestSchema.parse(data);
  return apiClient.rpc('create_request', validatedData);
};
```

### XSS Prevention
```typescript
// Always sanitize user content
import DOMPurify from 'dompurify';

const SafeHtml = ({ content }: { content: string }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
```

### Environment Variables
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

export const env = envSchema.parse(import.meta.env);
```

## Deployment Guide

### Build Process
```bash
# Production build
bun run build

# Analyze bundle size
bun run analyze

# Preview production build locally
bun run preview
```

### Environment Configuration
```bash
# .env.production
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_APP_ENV=production
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled and tested
- [ ] Edge functions deployed
- [ ] SSL certificates configured
- [ ] Performance optimization applied
- [ ] Error monitoring setup
- [ ] Backup procedures in place
- [ ] Security headers configured
- [ ] CDN configured for static assets

## Troubleshooting

### Common Development Issues

#### Build Errors
```bash
# Clear build cache
rm -rf dist node_modules/.vite
bun install
bun run build

# Type checking issues
bun run type-check
```

#### Supabase Connection Issues
```typescript
// Test Supabase connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .single();
    
    if (error) throw error;
    console.log('Supabase connected successfully');
  } catch (error) {
    console.error('Supabase connection failed:', error);
  }
};
```

#### Performance Issues
```typescript
// Debug React renders
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Render:', { id, phase, actualDuration });
};

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

### Debugging Tools
- React Developer Tools
- React Query Devtools
- Supabase Dashboard
- Network tab in browser devtools
- Performance tab for optimization

---

This guide provides the foundation for developing and maintaining the Document Request Management System. For additional questions or clarifications, refer to the technical documentation or contact the development team.