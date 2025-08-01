# Technical Documentation - Document Request Management System

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Design](#database-design)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Endpoints](#api-endpoints)
7. [File Structure](#file-structure)
8. [Development Setup](#development-setup)
9. [Deployment](#deployment)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

## System Overview

The Document Request Management System is a React-based web application built for managing document requests across different user roles. The system facilitates the workflow from document request creation to delivery confirmation.

### Key Features
- Multi-role user management (FA Admin, Requester, Receiver)
- Document request lifecycle management
- Real-time notifications via email
- Export functionality for reports
- Responsive design with dark/light mode support

### System Requirements
- Node.js 18+
- Modern web browser with JavaScript enabled
- Internet connection for Supabase integration

## Technology Stack

### Frontend
- **React 18.3.1**: UI library
- **TypeScript**: Type safety and better developer experience
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Component library built on Radix UI
- **React Router 6**: Client-side routing
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **TanStack Query**: Server state management
- **Lucide React**: Icon library

### Backend & Database
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Primary database
- **Supabase Auth**: Authentication service
- **Supabase Edge Functions**: Serverless functions
- **Row Level Security (RLS)**: Database security

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **Bun**: Package manager and runtime

## Architecture

### Component Architecture
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── ApprovalForm.tsx
│   ├── FileRequestForm.tsx
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── RequestStatusBadge.tsx
│   ├── RequestTable.tsx
│   ├── TrackingDetails.tsx
│   └── UserPathsManager.tsx
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── context/            # React context providers
├── integrations/       # External service integrations
└── types/              # TypeScript type definitions
```

### Data Flow
1. **User Authentication**: Handled by Supabase Auth
2. **State Management**: React Context + TanStack Query
3. **Database Operations**: Supabase client with RLS policies
4. **Real-time Updates**: Supabase realtime subscriptions
5. **File Storage**: Supabase Storage buckets

## Database Design

### Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('fa_admin', 'requester', 'receiver')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### requests
```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  receiver_email TEXT NOT NULL,
  requester_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'rework', 'completed')),
  tracking_number TEXT,
  shipping_vendor TEXT,
  admin_id UUID REFERENCES profiles(id),
  is_delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### user_paths
```sql
CREATE TABLE user_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('fa_admin', 'requester', 'receiver')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Functions

#### get_all_requests()
Returns all requests with requester information for admin dashboard.

#### create_request()
Creates a new document request with validation.

#### approve_request()
Approves a request and sets tracking information.

#### confirm_delivery()
Confirms document delivery by receiver.

### Row Level Security (RLS)

#### profiles table
- Users can read their own profile
- FA Admins can read all profiles
- Only authenticated users can insert/update their own profile

#### requests table
- Requesters can read their own requests
- Receivers can read requests sent to them
- FA Admins can read all requests
- Appropriate insert/update policies based on role

#### user_paths table
- FA Admins have full access
- Other roles can only read

## Authentication & Authorization

### Authentication Flow
1. User logs in via Supabase Auth
2. Profile is created/updated in profiles table
3. User role determines access permissions
4. RLS policies enforce authorization

### User Roles
- **fa_admin**: Full system access, can manage all requests and users
- **requester**: Can create and track their own requests
- **receiver**: Can view requests sent to them and confirm delivery

### Protected Routes
Routes are protected based on user role and authentication status:
- `/admin/*`: FA Admin only
- `/requester/*`: Requester only
- `/receiver/*`: Receiver only

## API Endpoints

### Supabase RPC Functions
- `get_all_requests()`: Get all requests with user details
- `create_request(params)`: Create new request
- `approve_request(params)`: Approve request with tracking
- `confirm_delivery(params)`: Confirm document delivery

### Supabase Edge Functions
- `send-request-notification`: Send email notifications
- `admin-delete-user`: Admin user deletion with cleanup

## File Structure

```
project-root/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   └── *.tsx          # Feature components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   │   └── utils/         # Helper functions
│   ├── context/           # React contexts
│   ├── integrations/      # External integrations
│   │   └── supabase/      # Supabase setup
│   ├── types/             # TypeScript types
│   ├── index.css          # Global styles
│   └── main.tsx           # App entry point
├── supabase/              # Supabase configuration
│   ├── config.toml        # Supabase config
│   └── functions/         # Edge functions
├── documentation/         # Project documentation
└── configuration files    # Various config files
```

## Development Setup

### Prerequisites
```bash
# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Or use npm/yarn
node --version  # Should be 18+
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd document-request-system

# Install dependencies
bun install
# or npm install

# Setup environment variables
cp .env.example .env.local
# Fill in Supabase credentials
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Commands
```bash
# Start development server
bun dev
# or npm run dev

# Build for production
bun run build
# or npm run build

# Preview production build
bun run preview
# or npm run preview

# Lint code
bun run lint
# or npm run lint
```

## Deployment

### Supabase Setup
1. Create new Supabase project
2. Run database migrations
3. Set up RLS policies
4. Configure Edge Functions
5. Set environment variables

### Frontend Deployment
The application can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- Supabase hosting

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Edge Functions deployed
- [ ] Email templates configured
- [ ] Error monitoring setup
- [ ] Performance optimization
- [ ] Security headers configured

## Testing

### Test Strategy
- Unit tests for utility functions
- Integration tests for components
- E2E tests for critical user flows
- Manual testing for UI/UX

### Recommended Testing Tools
- Vitest for unit testing
- React Testing Library for component testing
- Playwright for E2E testing

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check Supabase connection
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/profiles?select=*"
```

#### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

#### Type Errors
```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

### Performance Optimization
- Enable React.StrictMode for development
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with code splitting
- Use Supabase connection pooling

### Security Considerations
- Always use RLS policies
- Validate user input with Zod schemas
- Implement proper error handling
- Use HTTPS in production
- Regular security audits

## Version History
- v1.0.0: Initial release with core functionality
- v1.1.0: Added export functionality and improved UX
- v1.2.0: Enhanced filtering and search capabilities

---

For more information, refer to the individual component documentation and the API reference guide.