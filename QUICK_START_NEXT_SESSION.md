# Quick Start Guide for Next Session

## 🎯 Goal
Implement frontend admin dashboard pages (Tasks 6.1-6.13)

## 📋 Copy This Into Your Next Chat

```
CONTEXT TRANSFER:

I'm implementing the admin dashboard frontend for an online courses platform.

BACKEND STATUS: ✅ Complete
- 68 API endpoints ready at /api/admin/*
- Redis and Bull queue infrastructure operational
- All services, controllers, routes implemented
- Authentication working

FRONTEND STATUS: 🔄 Needs Implementation
- 13 admin pages to build
- Shared components library
- API integration layer

TECH STACK:
- Next.js 14 (App Router)
- React, Tailwind CSS, shadcn/ui
- Backend: http://localhost:3000

START WITH:
1. Create API client utility (lib/api/client.js)
2. Build shared components (components/admin/shared/)
3. Implement Analytics Dashboard (app/dashboard/admin/analytics/page.js)

REFERENCE:
- See FRONTEND_IMPLEMENTATION_PROMPT.md for complete specs
- All API endpoints documented in backend/routes/admin.routes.js
- Requirements in .kiro/specs/admin-dashboard-enhancement/requirements.md

Please start by creating the API client with authentication, then build the shared components.
```

## 📁 Files You'll Need to Reference

1. **FRONTEND_IMPLEMENTATION_PROMPT.md** - Complete specifications
2. **backend/routes/admin.routes.js** - All API endpoints
3. **.kiro/specs/admin-dashboard-enhancement/requirements.md** - Requirements
4. **SESSION_SUMMARY.md** - What was completed today

## 🚀 Implementation Order

### Phase 1: Foundation (Start Here) ⭐
```
1. lib/api/client.js - API client with auth
2. lib/api/admin/*.js - API functions for each feature
3. components/admin/shared/AnalyticsCard.jsx
4. components/admin/shared/DataTable.jsx
5. components/admin/shared/ChartWrapper.jsx
6. components/admin/shared/FilterBar.jsx
7. components/admin/shared/ExportButton.jsx
8. components/admin/shared/AIInsightPanel.jsx
9. components/admin/shared/DateRangePicker.jsx
```

### Phase 2: Priority Pages
```
10. app/dashboard/admin/analytics/page.js - Analytics Dashboard
11. app/dashboard/admin/notifications/page.js - Notifications
12. app/dashboard/admin/logs/page.js - Audit Logs
```

### Phase 3: Management Pages
```
13. app/dashboard/admin/categories/page.js
14. app/dashboard/admin/coupons/page.js
15. app/dashboard/admin/settings/page.js
16. app/dashboard/admin/instructors/page.js
```

### Phase 4: Advanced Pages
```
17. app/dashboard/admin/financial/page.js
18. app/dashboard/admin/reports/page.js
19. app/dashboard/admin/marketing/page.js
20. app/dashboard/admin/platform-analytics/page.js
```

### Phase 5: Navigation
```
21. Update sidebar navigation component
```

## 🔌 Quick API Reference

All endpoints: `http://localhost:3000/api/admin/*`

**Most Used Endpoints:**
- `GET /analytics/overview` - Dashboard overview
- `POST /notifications/broadcast` - Send notification
- `GET /logs/audit` - Audit logs
- `GET /categories` - List categories
- `GET /coupons` - List coupons

**Authentication:**
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 📦 Dependencies to Install

```bash
cd frontend

# Charts
npm install recharts

# Date handling
npm install date-fns

# Forms
npm install react-hook-form zod @hookform/resolvers

# Data fetching
npm install swr

# Icons
npm install lucide-react

# Notifications
npm install sonner
```

## 💻 Example API Client

```javascript
// lib/api/client.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
}

// Usage
export const adminAPI = {
  analytics: {
    getOverview: (params) => 
      apiClient(`/api/admin/analytics/overview?${new URLSearchParams(params)}`),
    getRevenue: (params) => 
      apiClient(`/api/admin/analytics/revenue?${new URLSearchParams(params)}`),
  },
  notifications: {
    broadcast: (data) => 
      apiClient('/api/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getHistory: (params) => 
      apiClient(`/api/admin/notifications/history?${new URLSearchParams(params)}`),
  },
  // ... more endpoints
};
```

## 🎨 Example Shared Component

```javascript
// components/admin/shared/AnalyticsCard.jsx
export function AnalyticsCard({ title, value, change, icon: Icon, loading }) {
  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        {Icon && <Icon className="w-8 h-8 text-blue-500" />}
      </div>
    </div>
  );
}
```

## 🎯 Success Checklist

For each page, ensure:
- [ ] Loads data from API
- [ ] Shows loading state
- [ ] Handles errors
- [ ] Responsive design
- [ ] Form validation (if applicable)
- [ ] Search/filter works
- [ ] Export works (if applicable)
- [ ] Follows design system

## 🆘 If You Get Stuck

1. **API not working?**
   - Check backend is running: `npm start` in backend folder
   - Check Redis is running: `redis-cli ping`
   - Verify token in localStorage

2. **Component not rendering?**
   - Check console for errors
   - Verify data structure from API
   - Check prop types

3. **Styling issues?**
   - Verify Tailwind classes
   - Check responsive breakpoints
   - Use browser inspector

## 📞 Quick Commands

```bash
# Start backend
cd backend && npm start

# Start workers
cd backend && node workers/index.js

# Start frontend
cd frontend && npm run dev

# Test Redis
redis-cli ping

# Check API
curl http://localhost:3000/api/admin/analytics/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎉 You're Ready!

Everything is set up and ready for frontend implementation. The backend is fully functional with 68 API endpoints waiting to be consumed.

Good luck! 🚀
