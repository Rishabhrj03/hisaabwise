/**
 * services/index.ts — Service Factory (Single Swap Point)
 *
 * ✅ Currently wired to: MongoDB (via Next.js API routes)
 *
 * Architecture:
 *   React Context → Fetch Adapter → /api/* route → MongoDB (server only)
 *
 * MongoDB uses Node.js built-ins (net, tls) that can't run in the browser.
 * The Fetch adapters call our own API routes which execute MongoDB server-side.
 *
 * To swap the database:
 *   1. Create new API routes pointing at the new database
 *   2. The fetch adapters and all contexts require zero changes
 *
 * To swap from fetch to direct DB calls (e.g., server components only):
 *   1. Import MongoExpenseService etc. from @/services/mongodb/*
 *   2. Pass `clientPromise` from @/lib/mongoClient
 */

import { IExpenseService } from '@/services/interfaces/IExpenseService';
import { IFriendService } from '@/services/interfaces/IFriendService';
import { IGroupService } from '@/services/interfaces/IGroupService';

import { FetchExpenseService } from '@/services/fetch/FetchExpenseService';
import { FetchFriendService } from '@/services/fetch/FetchFriendService';
import { FetchGroupService } from '@/services/fetch/FetchGroupService';

export const expenseService: IExpenseService = new FetchExpenseService();
export const friendService: IFriendService = new FetchFriendService();
export const groupService: IGroupService = new FetchGroupService();


