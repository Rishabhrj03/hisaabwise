# 📊 Smart Expense Tracker - Application Documentation

## 1. Project Overview
**Smart Expense Tracker** is a modern, feature-rich web application designed to help users manage their personal finances, track expenses, split bills with friends/groups, and visualize spending habits. It is built with performance, accessibility, and user experience in mind, supporting both Desktop and Mobile (PWA) environments.

## 2. Technology Stack

### Core Frameworks & Libraries
- **Frontend Framework:** [Next.js 16](https://nextjs.org/) (React 19) - utilizing App Router.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - for robust type safety.
- **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose ODM).
- **Styling:** CSS Modules / Global CSS with CSS Variables for theming (Light/Dark mode).
- **Authentication:** Custom JWT-based authentication.

### Key Features & Libraries
- **Charts & Visualization:** `chart.js`, `react-chartjs-2`, `recharts` for financial insights.
- **PWA Support:** `@ducanh2912/next-pwa` for offline capabilities and installability.
- **Voice Input:** Native Speech Synthesis and Recognition integration for quick expense adding.
- **QR Code Scanning:** `html5-qrcode` for scanning recipient codes or features.
- **Data Export:** `xlsx` (Excel) and `jspdf` (PDF) generation.
- **Notifications:** `web-push` and `nodemailer` for alerts and reports.

## 3. Key Features

### 💰 Expense Management
- **Transactions:** Add Income, Expenses, or Transfers.
- **Categorization:** Custom categories with icons.
- **Voice Support:** Add expenses using voice commands (e.g., "Spent 50 dollars on groceries").

### 🤝 Social & Splitting
- **Groups:** Create groups for shared expenses (e.g., "Trip to Vegas", "Housemates").
- **Friends:** Add friends to easily split bills.
- **Split Methods:**
    - **Equal:** Split equally among selected members.
    - **Exact Amount:** Specify exact amounts for each person.
    - **Percentage:** Split by custom percentages.

### 📈 Analytics
- **Dashboard:** Real-time overview of Balance, Income, and Expenses.
- **Charts:** Monthly spending trends, category breakdowns, and income vs. expense analysis.

### 🛠 Tools
- **Budgeting:** Set monthly budgets per category.
- **Recurring Expenses:** Manage subscriptions and recurring payments.
- **Import/Export:** Export data to PDF/Excel for external analysis.
- **Financial Calculators:** Built-in Loans and Investment calculators.

## 4. Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── api/             # Backend API endpoints
│   ├── (auth)/          # Authentication pages (login, register)
│   ├── dashboard/       # Main dashboard views
│   └── globals.css      # Global styles and theme variables
├── components/          # Reusable React components
│   ├── dashboard/       # Dashboard-specific components (charts, lists)
│   ├── ui/              # Generic UI elements (Buttons, Modals, Cards)
│   └── ...
├── context/             # React Context Providers (Auth, Expense, Group state)
├── lib/                 # Utility libraries (DB connection, Auth helpers)
├── models/              # Mongoose Data Models (User, Expense, Group)
├── utils/               # Helper functions (Currency formatting, Export logic)
├── types/               # TypeScript interfaces
└── hooks/               # Custom React Hooks
```

## 5. Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URL)

### Installation Steps
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd expense-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root directory and add the following:
    ```env
    MONGODB_URI=mongodb://localhost:27017/expense-tracker
    JWT_SECRET=your_super_secret_jwt_key
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    
    # Optional - For Email/Push features
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
    VAPID_PRIVATE_KEY=...
    EMAIL_USER=...
    EMAIL_PASS=...
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

5.  **Build for Production:**
    ```bash
    npm run build
    npm start
    ```

## 6. API Reference (Overview)

The application exposes a RESTful API under `/api/*`.

- **Auth:**
    - `POST /api/auth/register` - Create new user.
    - `POST /api/auth/login` - Authenticate user.
    - `GET /api/user/profile` - Get current user details.

- **Expenses:**
    - `GET /api/expenses` - List user expenses.
    - `POST /api/expenses` - Create new expense.
    - `DELETE /api/expenses/[id]` - Delete expense.

- **Groups & Friends:**
    - `GET /api/groups` - Get user groups.
    - `POST /api/groups` - Create a group.
    - `GET /api/friends` - Get friend list.
```
