# Notification Campaign System - Frontend

A modern, production-ready React frontend for managing notification campaigns with role-based access control.

## 🚀 Features

### Pages & Functionality

1. **Authentication**
   - User Login & Signup
   - Admin Login (separate portal)
   - Role-based authentication

2. **Dashboard**
   - Real-time metrics (Active Users, Campaigns Sent, Success Rate)
   - Activity charts with notification trends
   - Campaign distribution visualization
   - Recent activity feed

3. **User Management**
   - Full CRUD operations for users
   - Bulk upload via JSON or CSV
   - Advanced filtering (search, city, status)
   - Active/Inactive toggle
   - Role-based permissions

4. **Notification Preferences**
   - Manage user notification opt-ins
   - Three categories: Offers, Order Updates, Newsletter
   - Bulk preference updates
   - Visual preference statistics

5. **Campaign Management**
   - Create and manage campaigns
   - Filter by notification type and city
   - Draft and sent status tracking
   - Recipient preview before sending
   - Campaign analytics

6. **Recipient Preview**
   - Real-time eligible recipient calculation
   - Filtering logic display
   - CSV export functionality
   - Confirm & send workflow

7. **Notification Logs**
   - Comprehensive audit trail
   - Filter by campaign, status, date
   - Success/failure tracking
   - Export to CSV

8. **User Preference Center (Public)**
   - Public-facing preference management
   - User-friendly interface for end users
   - Real-time preference updates

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for modern, responsive UI
- **Zustand** for state management
- **React Router** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons

## 📦 Project Structure

```
src/
├── components/
│   ├── layout/           # Layout components (Sidebar, Header, DashboardLayout)
│   ├── ui/               # Reusable UI components (Button, Input, Card, Modal, etc.)
│   └── ProtectedRoute.tsx
├── pages/
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard with metrics
│   ├── users/            # User management
│   ├── preferences/      # Notification preferences
│   ├── campaigns/        # Campaign management
│   └── logs/             # Notification logs
├── store/
│   ├── authStore.ts      # Authentication state
│   ├── userStore.ts      # User management state
│   ├── campaignStore.ts  # Campaign state
│   └── preferenceStore.ts # Preferences state
├── types/
│   └── index.ts          # TypeScript types and interfaces
├── App.tsx               # Main app with routing
├── main.tsx              # Entry point
└── index.css             # Global styles with Tailwind
```

## 🎨 Design Features

- **Modern UI/UX**: Clean, professional interface with smooth transitions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Role-Based UI**: Different views for Admin, Creator, and Viewer roles
- **Color-Coded Categories**: Visual distinction for notification types
- **Interactive Components**: Hover effects, loading states, modals
- **Gradient Backgrounds**: Modern gradient accents throughout

## 👥 Role Permissions

### Admin
- ✅ Full access to all features
- ✅ User CRUD operations
- ✅ Campaign creation and management
- ✅ Send campaigns
- ✅ View and export logs

### Creator
- ✅ Create and update users
- ✅ Create and manage campaigns
- ✅ Send campaigns
- ✅ View logs
- ❌ Delete users

### Viewer
- ✅ View dashboards and data
- ✅ Download reports
- ❌ Create or modify data
- ❌ Send campaigns

## 🚦 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app will be available at `http://localhost:5173`

**Default Login Credentials:**
- User: any email/password (mock authentication)
- Admin: `/admin/login` with any credentials

## 🎯 Key Features

### State Management
- **Zustand stores** for efficient global state
- **Persistent auth** with localStorage
- **Optimistic updates** for better UX

### UI Components
All components are production-ready with:
- TypeScript support
- Accessibility features
- Loading and error states
- Responsive design
- Consistent styling

### Routing
- Protected routes with authentication
- Role-based route access
- Clean URL structure
- Catch-all redirect

## 🔄 Mock Data

Currently uses mock data for demonstration. To connect to real APIs:

1. Update store actions to call API endpoints
2. Replace mock data with API responses
3. Add error handling for API failures
4. Implement proper loading states

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Color Palette

- Primary: Blue (#0ea5e9)
- Success: Green (#10b981)
- Warning: Orange/Yellow (#f59e0b)
- Error: Red (#ef4444)
- Dark: Slate (#1e293b)

## 📝 Next Steps

1. Connect to backend APIs
2. Add real-time notifications
3. Implement proper authentication
4. Add unit and integration tests
5. Set up CI/CD pipeline
6. Add analytics tracking

## 📄 License

This project is part of the Notification Campaign System.
