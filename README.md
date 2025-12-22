<p align="center">
  <img src="public/logo-no-bg.png" alt="Prioritize Logo" width="120" height="120">
</p>

<h1 align="center">Prioritize</h1>

<p align="center">
  <strong>Next-Gen Task Intelligence for Teams & Individuals</strong>
</p>

<p align="center">
  A modern, priority-centric task management system that separates your <em>Solo Missions</em> from <em>Team Objectives</em> while keeping priority at the absolute center.
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#api-reference">API Reference</a>
</p>

---

## Overview

**Prioritize** is a full-stack task management application built with Next.js 16, featuring a premium glassmorphic UI design, team-based collaboration, and a unique priority-first approach to task organization. Whether you're managing personal tasks or coordinating with a team, Prioritize keeps what matters most front and center.

### Why Prioritize?

- 🎯 **Priority-First Design**: Tasks are organized by priority (Urgent → High → Medium → Low), not just status
- 👤 **Dual Workspace Model**: Switch instantly between personal "Private Space" and team "Team Hub"
- 🏢 **Multi-Tenant Architecture**: Manage multiple companies/teams with distinct workspaces
- 🔐 **Role-Based Access Control**: Admin, Officer, and User roles for fine-grained permissions
- 🌙 **Premium UI/UX**: Modern glassmorphic design with dark/light theme support

---

## Features

### Core Features

| Feature               | Description                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| **Priority Board**    | Visual Kanban-style board organized by priority levels (Urgent, High, Medium, Low) |
| **Personal Space**    | Private task management area for non-team tasks                                    |
| **Team Hub**          | Collaborative workspace for company/team tasks                                     |
| **Task Assignment**   | Assign tasks to multiple team members                                              |
| **Due Date Tracking** | Track deadlines with date-based organization                                       |
| **Status Management** | Track task status (Pending, In Progress, Completed)                                |

### Team & Organization

| Feature                    | Description                                         |
| -------------------------- | --------------------------------------------------- |
| **Multi-Company Support**  | Users can belong to multiple companies/teams        |
| **Role-Based Permissions** | Three-tier role system (Admin, Officer, User)       |
| **Team Invitations**       | Invite members via email with invitation management |
| **Public/Private Tasks**   | Control task visibility within teams                |
| **Admin Panel**            | Dedicated admin interface for team management       |

### UI/UX

| Feature                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| **Glassmorphic Design** | Modern, premium aesthetic with blur effects         |
| **Dark/Light Themes**   | Full theme support with system preference detection |
| **Responsive Layout**   | Mobile-first design with adaptive navigation        |
| **Smooth Animations**   | Micro-interactions and transitions throughout       |

---

## Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

### Backend

- **API Routes**: Next.js Route Handlers
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Validation**: [Zod](https://zod.dev/)

### Development

- **Language**: TypeScript 5
- **Package Manager**: pnpm
- **Linting**: ESLint 9

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **pnpm** (recommended) or npm/yarn
- **PostgreSQL** database

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Urcodingbuddy/prioritize.git
   cd prioritize
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/prioritize"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Initialize the database**

   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
pnpm build
pnpm start
```

---

## Project Structure

```
prioritize/
├── app/                          # Next.js App Router
│   ├── api/                      # API Route Handlers
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── companies/            # Company management
│   │   ├── tasks/                # Task CRUD operations
│   │   ├── teams/                # Team management
│   │   └── users/                # User management
│   ├── admin/                    # Admin panel pages
│   ├── dashboard/                # Personal dashboard
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── tasks/                    # Task detail pages
│   ├── teams/                    # Team pages
│   ├── globals.css               # Global styles & design tokens
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── AuthForm.tsx              # Authentication form
│   ├── DashboardHeader.tsx       # Dashboard header
│   ├── DashboardLayout.tsx       # Dashboard layout wrapper
│   ├── PriorityBoard.tsx         # Priority-based task board
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── TaskCard.tsx              # Task card component
│   ├── TaskForm.tsx              # Task create/edit form
│   ├── TaskList.tsx              # Task list view
│   ├── TeamInvites.tsx           # Team invitation management
│   └── ThemeToggle.tsx           # Theme switcher
├── lib/                          # Utility functions & types
│   ├── api.ts                    # API client functions
│   ├── auth.ts                   # Authentication utilities
│   ├── prisma.ts                 # Prisma client instance
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema definition
├── public/                       # Static assets
└── package.json                  # Project dependencies
```

---

## API Reference

### Authentication

| Endpoint             | Method | Description                 |
| -------------------- | ------ | --------------------------- |
| `/api/auth/register` | POST   | Register a new user         |
| `/api/auth/login`    | POST   | Login and receive JWT token |
| `/api/auth/logout`   | POST   | Logout and clear session    |
| `/api/auth/me`       | GET    | Get current user profile    |

### Tasks

| Endpoint          | Method | Description               |
| ----------------- | ------ | ------------------------- |
| `/api/tasks`      | GET    | List tasks (with filters) |
| `/api/tasks`      | POST   | Create a new task         |
| `/api/tasks/[id]` | GET    | Get task details          |
| `/api/tasks/[id]` | PUT    | Update a task             |
| `/api/tasks/[id]` | DELETE | Delete a task             |

### Teams & Companies

| Endpoint                 | Method | Description              |
| ------------------------ | ------ | ------------------------ |
| `/api/companies`         | GET    | List user's companies    |
| `/api/companies`         | POST   | Create a new company     |
| `/api/teams/members`     | GET    | List team members        |
| `/api/teams/invite`      | POST   | Invite a member          |
| `/api/teams/invitations` | GET    | List pending invitations |

---

## Database Schema

### Core Models

```
User ─────────┬───────── TeamMembership ─────── Company
              │                                    │
              │                                    │
              └───────── Task ─────────────────────┘
                           │
                           │
                       UserTask (assignments)
```

### Enums

- **Priority**: `LOW` | `MEDIUM` | `HIGH` | `URGENT`
- **Status**: `PENDING` | `IN_PROGRESS` | `COMPLETED`
- **Role**: `USER` | `OFFICER` | `ADMIN`
- **InvitationStatus**: `PENDING` | `ACCEPTED` | `DECLINED`

---

## Usage

### Personal Task Management

1. **Login** or **Register** for an account
2. Access your **Personal Space** (Dashboard)
3. Create tasks with priority levels, due dates, and descriptions
4. View tasks organized by priority on the **Priority Board**

### Team Collaboration

1. Navigate to **Teams** from the sidebar
2. **Create a company** or accept an invitation
3. Switch between companies using the company selector
4. Create **public tasks** visible to all team members
5. **Assign tasks** to specific team members
6. Use the **Admin Panel** (Admin role) to manage members and roles

---

## Scripts

| Command                | Description              |
| ---------------------- | ------------------------ |
| `pnpm dev`             | Start development server |
| `pnpm build`           | Build for production     |
| `pnpm start`           | Start production server  |
| `pnpm lint`            | Run ESLint               |
| `pnpm prisma generate` | Generate Prisma client   |
| `pnpm prisma db push`  | Push schema to database  |
| `pnpm prisma studio`   | Open Prisma Studio       |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is private and proprietary.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Urcodingbuddy">@Urcodingbuddy</a>
</p>
