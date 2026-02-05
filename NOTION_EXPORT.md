# 📘 Smart Expense Tracker - Master Documentation

> **Note:** This document combines both the User Guide and Technical Reference. You can copy and paste this entire content directly into a Notion page, and it will automatically format itself.

---

# Part 1: Application Overview

## 1. Project Overview
**Smart Expense Tracker** is a modern, feature-rich web application designed to help users manage personal finances, track expenses, split bills with friends, and visualize spending habits.

## 2. Key Features

### 💰 Expense Management
- **Transactions:** Add Income, Expenses, or Transfers.
- **Categorization:** Custom categories with icons.
- **Voice Support:** Add expenses using voice commands (e.g., "Spent 50 dollars on groceries").

### 🤝 Social & Splitting
- **Groups:** Create groups for shared expenses (e.g., "Trip to Vegas").
- **Friends:** Add friends to easily split bills.
- **Split Methods:** Equal, Exact Amount, or Percentage.

### 📈 Analytics
- **Dashboard:** Real-time overview of Balance, Income, and Expenses.
- **Charts:** Monthly spending trends and category breakdowns.

### 🛠 Tools
- **PWA Support:** Installable on mobile devices with offline capabilities.
- **Export:** Download data as Excel or PDF.
- **Recurring Expenses:** Manage subscriptions.

---

# Part 2: Technical Reference

## 1. System Architecture
The application follows a **Client-Server** architecture using Next.js.
- **Frontend:** React (Next.js App Router).
- **Backend:** Next.js API Routes (Serverless).
- **Database:** MongoDB (Mongoose ODM).
- **State:** React Context API + SWR.

### Data Flow Overview
1.  User Action (UI)
2.  API Call (`/api/*`)
3.  Server Authentication (JWT)
4.  Database Query (MongoDB)
5.  UI Update (SWR/Context)

## 2. Technology Stack
- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Database:** MongoDB
- **Styling:** CSS Modules / Global CSS Variables
- **Auth:** JWT (HTTP-Only Cookie)

## 3. Database Schema

### 👤 User Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full Name |
| `email` | String | Unique Email |
| `password` | String | Bcrypt Hash |
| `bankAccounts` | Array | Embedded accounts |

### 💸 Expense Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `amount` | Number | Value |
| `type` | String | income/expense/transfer |
| `category` | String | Category Name |
| `splitDetails` | Object | `{ paidBy, shares: [] }` |

### 👥 Group & Friend Models
- **Group:** Collection of User IDs + Metadata.
- **Friend:** Lightweight contact entity linked to a User.

## 4. API Specification

### Authentication
- `POST /api/auth/register` - New User
- `POST /api/auth/login` - Login (Returns HTTP-Only Cookie)
- `GET /api/user/profile` - Get Session User

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create new
- `DELETE /api/expenses/:id` - Remove

## 5. Security Implementation
- **JWT:** Signed with `HS256`, stored in HTTP-Only cookies to prevent XSS.
- **Middleware:** Validates session before access to protected routes.
- **Validation:** Mongoose schemas ensure data integrity.

---

# Part 3: Setup Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Connection String

### Installation
1.  **Clone & Install**
    ```bash
    git clone <repo>
    npm install
    ```
2.  **Environment Variables (`.env.local`)**
    ```env
    MONGODB_URI=mongodb://...
    JWT_SECRET=secret
    ```
3.  **Run**
    ```bash
    npm run dev
    ```

---

# Part 4: Database Diagrams

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Expense : "creates"
    User ||--o{ Group : "admin"
    User ||--o{ Friend : "adds"
    User ||--o{ Budget : "sets"
    User ||--o{ Goal : "defines"
    User ||--o{ Investment : "tracks"
    User ||--o{ Loan : "manages"
    User ||--o{ RecurringExpense : "schedules"
    User ||--o{ Category : "customizes"
    User ||--o{ Subscription : "subscribes"
    
    User }|..|{ Group : "member"
    Group ||--o{ Expense : "contains"
    
    User {
        ObjectId _id
        String name
        String email
        String password
        String phone
        String image
        Boolean isPublic
        String shareToken
        Object[] bankAccounts "name, type, balance, creditLimit, billingDate"
        String user_upi_id
        Boolean isEmailVerified
        String emailVerificationToken
        Date emailVerificationExpire
        Boolean isPhoneVerified
        String phoneVerificationCode
        String resetPasswordToken
        Date resetPasswordExpire
        Boolean termsAccepted
        Date termsAcceptedAt
        Date created_at
        Date updated_at
    }

    Expense {
        ObjectId _id
        String description
        Number amount
        Date date
        String type "income, expense, transfer"
        String category
        ObjectId created_by
        ObjectId group_id
        Object splitDetails "paidBy, shares[{userId, amount}]"
        String[] relatedTo
        Date created_at
        Date updated_at
    }

    Group {
        ObjectId _id
        String name
        ObjectId created_by
        String[] members
        Date created_at
        Date updated_at
    }

    Friend {
        ObjectId _id
        ObjectId user_id
        String name
        String phone
        ObjectId linked_user_id
        String upi_id
        Date created_at
        Date updated_at
    }

    Budget {
        ObjectId _id
        ObjectId user_id
        String category
        Number amount
        String period "monthly, yearly"
        Date created_at
        Date updated_at
    }

    Category {
        ObjectId _id
        ObjectId user_id
        String name
        String color
        String icon
        Boolean is_default
        Date created_at
        Date updated_at
    }

    Goal {
        ObjectId _id
        ObjectId user_id
        String name
        Number targetAmount
        Number currentAmount
        Date deadline
        String color
        Date created_at
        Date updated_at
    }

    Investment {
        ObjectId _id
        ObjectId user_id
        String name
        String type "SIP, MutualFund, Stock, etc"
        Number currentAmount
        Date startDate
        Number autoIncreaseAmount
        String autoIncreaseFrequency
        Date lastAutoUpdate
        Date created_at
        Date updated_at
    }

    Loan {
        ObjectId _id
        ObjectId user_id
        String name
        String type "borrowed, lent"
        Number principalAmount
        Number interestRate
        Date startDate
        Number tenureMonths
        String repaymentType "emi, one-time"
        Number paidAmount
        Number emiAmount
        Date created_at
        Date updated_at
    }

    RecurringExpense {
        ObjectId _id
        ObjectId user_id
        String name
        Number amount
        String category
        String frequency "monthly, yearly"
        Date nextDueDate
        Boolean isAutoDebit
        Date created_at
        Date updated_at
    }

    Subscription {
        ObjectId _id
        ObjectId user_id
        String endpoint
        Object keys "p256dh, auth"
        Date created_at
        Date updated_at
    }
```
