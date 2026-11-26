# Hisaabwise (HISAABWISE)

> Track Expenses, Split Bills & Analyze Finances Easily.

A full-stack personal finance and group expense tracking application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **NextAuth v5**, and **MongoDB**.

---

## 🌟 Key Features

- **Personal Expense & Income Tracking**: Categorized spending with real-time analytics, charts, and budget insights.
- **Group & Splitwise-style Bill Splitting**: Split expenses among friends and groups with automated balance calculations and settlement tracking.
- **WhatsApp Share & Invites**: Direct WhatsApp integration for bill invites and payment settlement reminders.
- **PDF & Excel Data Export**: Generate downloadable financial reports and spreadsheets.
- **Responsive Dark/Light UI**: Tailored themes with fluid responsiveness across mobile, tablet, and desktop.
- **PWA Ready**: Progressive Web App capabilities for mobile app-like experience.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript, Chart.js, Recharts
- **Backend / API**: Next.js Server Actions & Route Handlers
- **Database**: MongoDB (via native `mongodb` driver & `@auth/mongodb-adapter`)
- **Authentication**: NextAuth.js v5 with credentials & session management

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- MongoDB instance (local or Atlas)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rishabhrj03/hisaabwise.git
   cd hisaabwise
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and configure your credentials:
   ```bash
   cp .env.example .env.local
   ```
   Ensure `MONGODB_URI` and `AUTH_SECRET` are set.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📦 Scripts

- `npm run dev` - Launch development server with Turbopack / Next.js
- `npm run build` - Create optimized production bundle
- `npm run start` - Run production server
- `npm run lint` - Run ESLint code checks
