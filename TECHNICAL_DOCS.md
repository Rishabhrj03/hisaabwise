# 🛠 Technical Documentation

## 1. System Architecture

### Overview
The **Smart Expense Tracker** follows a modern **Client-Server** architecture (monolith) using Next.js.
- **Frontend:** React (Server & Client Components) served via Next.js App Router.
- **Backend:** Next.js API Routes (Serverless functions) communicating with MongoDB.
- **Database:** MongoDB (NoSQL) for flexible data storage.
- **State Management:** React Context API (Global State) + SWR (Data Fetching/Caching).

### Data Flow
1.  **User Action** → Triggers React Event.
2.  **State Update/API Call** → `useSWR` / `fetch` sends request to `/api/*`.
3.  **API Route** → Validates Session (JWT) → Connects to DB → Executes Query.
4.  **Database** → Returns BSON data.
5.  **Response** → JSON sent back to Client.
6.  **UI Update** → Context/Local State updates, re-rendering components.

## 2. Database Design (MongoDB Schema)

### User Model (`User.ts`)
Stores user identity, settings, and verification status.
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | User's full name. |
| `email` | String | Unique email address (Indexed). |
| `password` | String | Bcrypt hashed password (Selected: `false`). |
| `bankAccounts` | Array | Embedded List: `{ name, type, balance, billingDate }`. |
| `isEmailVerified` | Boolean | Email verification status. |
| `termsAccepted` | Boolean | Compliance flag. |
| `created_at` | Date | Timestamp. |

### Expense Model (`Expense.ts`)
The core transaction entity.
| Field | Type | Description |
| :--- | :--- | :--- |
| `amount` | Number | Transaction amount. |
| `type` | String | Enum: `'income'`, `'expense'`, `'transfer'`. |
| `category` | String | Category name (e.g., "Food"). |
| `created_by` | ObjectId | Ref: `User`. |
| `group_id` | ObjectId | Ref: `Group` (Optional). |
| `splitDetails` | Object | `{ paidBy: String, shares: [{ userId, amount }] }`. |
| `relatedTo` | Array | List of Friend IDs involved. |
| `date` | Date | Transaction date. |

### Group Model (`Group.ts`)
Collection of users for shared expenses.
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Group Name. |
| `created_by` | ObjectId | Ref: `User` (Admin). |
| `members` | Array | List of user/friend IDs. |

### Friend Model (`Friend.ts`)
Lightweight entity representing external contacts or unlinked users.
| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | ObjectId | The User who added this contact. |
| `name` | String | Friend's display name. |
| `linked_user_id`| ObjectId | (Optional) Maps to a real `User` if they join. |

## 3. Authentication & Security

### Authentication Flow
1.  **Login/Register:**
    - User submits credentials.
    - Server verifies hash (bcryptjs).
    - Server signs JWT (`userId`, `email`).
    - **Token Storage:** HTTP-Only, Secure, SameSite Cookie (`auth-token`).
2.  **Session Validation:**
    - `getSessionUser()` helper in `src/lib/auth.ts` extracts and verifies JWT from cookies on every protected API call.
    - `useAuth` hook on client fetches `/api/auth/me` to hydrate user state.

### Security Measures
- **HTTP-Only Cookies:** Prevents XSS attacks accessing the token.
- **Middleware/Checks:** API routes check presence and validity of tokens before sensitive operations.
- **Input Validation:** Mongoose schemas enforce types and required fields.

## 4. API Specification

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Create user | `{ email, password, name }` |
| **POST** | `/api/auth/login` | Authenticate | `{ email, password }` |
| **GET** | `/api/expenses` | List expenses | Query: `?month=X&year=Y` |
| **POST** | `/api/expenses` | Add expense | `{ amount, description, type, category... }` |
| **DELETE** | `/api/expenses/[id]`| Delete expense | Param: `id` |
| **PUT** | `/api/expenses/[id]` | Update expense | Param: `id`, Body: Partial Expense |
| **GET** | `/api/groups` | List groups | - |
| **POST** | `/api/groups` | Create group | `{ name, members: [] }` |

## 5. Client-Side State Management

### Context Providers (`src/context`)
- **`AuthContext`:** Manages global `user` object, loading state, and methods (`login`, `logout`). Subscribes to `/api/auth/me`.
- **`ExpenseContext`:**
    - Uses `useSWR` for real-time fetching/caching of expenses.
    - Provides `addExpense`, `deleteExpense` methods which optimistically update the UI or revalidate SWR cache.
- **`GroupContext`:** Manages groups and members state.
- **`FriendContext`:** Manages list of friends.

### Data Fetching (SWR)
We use `swr` for efficient data fetching:
```typescript
const { data, mutate } = useSWR('/api/expenses', fetcher);
```
- **Automatic Revalidation:** Data refreshes on window focus or network recovery.
- **Cache:** Instant loading of previously fetched data.

## 6. Directory Structure Deep Dive

- `src/app`: Routes. `page.tsx` is the UI, `route.ts` are API handlers.
- `src/components/ui`: Atomic, reusable components (Buttons, Cards, Modals).
- `src/components/dashboard`: Complex business-logic components (Charts, Forms).
- `src/lib`: Singletons and pure utility functions (DB connection, Auth).
- `src/utils`: Helper functions for formatting (Currency, Dates).
