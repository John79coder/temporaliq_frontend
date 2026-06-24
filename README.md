# TemporalIQ Frontend

> The modern React frontend for **TemporalIQ** — an AI-powered scheduling and time-blocking engine that integrates with Notion and iCloud Calendar.

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

**TemporalIQ Frontend** is a clean, type-safe, and highly maintainable single-page application (SPA) that provides an intuitive interface for the TemporalIQ AI scheduling system.

It enables users to:
- Authenticate securely (Email + Apple Sign In)
- Connect their Notion workspace and iCloud Calendar
- Let AI intelligently prioritize tasks and generate optimized time blocks
- Visualize and manage their schedule in a beautiful dashboard

This frontend is designed to work seamlessly with the [TemporalIQ Backend](https://github.com/John79coder/temporalIQ).

---

## ✨ Key Features

- **Modern Authentication** — Email/password + Apple Sign In
- **Guided Onboarding** — Step-by-step flow to connect Notion and iCloud Calendar
- **AI Schedule Generation** — Preview and apply intelligently generated time blocks
- **Interactive Dashboard** — Task list + Calendar view with AI-optimized blocks
- **User Preferences** — Customizable block size, work hours, max blocks per day, etc.
- **Responsive & Polished UI** — Built with Tailwind CSS and smooth interactions
- **Type-Safe & Scalable** — Full TypeScript coverage with clear modular architecture

---

## 🛠 Tech Stack

| Category              | Technology                          | Purpose |
|-----------------------|-------------------------------------|---------|
| **Framework**         | React 18 + TypeScript               | Core UI |
| **Build Tool**        | Vite                                | Fast development & builds |
| **Styling**           | Tailwind CSS                        | Utility-first design system |
| **Routing**           | React Router v6                     | Client-side navigation |
| **Server State**      | TanStack React Query                | Data fetching, caching & mutations |
| **Global State**      | Zustand                             | Lightweight client-side state |
| **HTTP Client**       | Axios                               | API communication |
| **Notifications**     | react-hot-toast                     | Elegant toast messages |
| **Icons**             | Lucide React (planned)              | Beautiful iconography |

---

## 📁 Project Structure

```
src/
├── api/                  # API layer (domain-specific modules)
│   ├── auth.ts
│   ├── calendar.ts
│   ├── client.ts         # Centralized Axios instance
│   ├── notion.ts
│   └── schedule.ts
├── components/           # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── common/           # Shared primitives (Button, Modal, etc.)
│   ├── dashboard/        # Dashboard-specific components
│   ├── layouts/          # AppLayout & AuthLayout
│   └── onboarding/       # Onboarding flow components
├── hooks/                # Custom React hooks
├── pages/                # Route-level pages
│   ├── Dashboard.tsx
│   ├── Onboarding.tsx
│   ├── Settings.tsx
│   ├── SignIn.tsx
│   └── Success.tsx
├── stores/               # Zustand stores
│   ├── authStore.ts
│   ├── onboardingStore.ts
│   └── scheduleStore.ts
├── types/                # TypeScript type definitions
├── utils/                # Helper functions & constants
└── styles/               # Global styles
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/John79coder/temporaliq_frontend.git
cd temporaliq_frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000

# Optional: Feature flags or third-party keys (if needed)
# VITE_APPLE_CLIENT_ID=your_apple_client_id
```

> **Note:** Ask the backend team for the correct `VITE_API_BASE_URL` in different environments.

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Other Useful Scripts

```bash
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript type checking
npm run preview       # Preview production build locally
```

---

## 🏗 Architecture Highlights

- **Layout-based routing** with protected routes
- **Clear separation** between API logic, state management, and UI
- **Hybrid state management**: React Query (server state) + Zustand (client state)
- **Domain-driven folder structure** that mirrors the backend architecture
- **Strong TypeScript** usage across the entire codebase
- **Component composition** for maximum reusability

---

## 🔗 Backend Integration

This frontend consumes the TemporalIQ Flask backend API. Key integration points include:

- Authentication & JWT handling
- Notion OAuth flow
- iCloud Calendar (CalDAV) connection
- Task extraction & AI schedule generation

The API layer (`src/api/`) is organized to match the backend modules for easy maintenance.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please follow the existing code style and run `npm run lint` and `npm run type-check` before submitting.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built as part of the **TemporalIQ** ecosystem
- Inspired by modern productivity tools and clean architecture principles

---

**Made with ❤️ for better time management**

> **Note to maintainers:** This README was generated based on the current project structure and planned features. Update it as new functionality is implemented.
