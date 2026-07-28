/**
 * services/index.ts — Service Factory (Single Swap Point)
 *
 * This is the ONLY file you need to change to replace the database or
 * auth provider. All contexts and components depend on the interfaces,
 * not on these concrete implementations.
 *
 * Example: To switch from Supabase to Firebase, create Firebase adapter
 * classes implementing the same interfaces, import them here, and wire them up.
 */

import { supabase } from '@/lib/supabaseClient';

import { IAuthService } from '@/services/interfaces/IAuthService';
import { IExpenseService } from '@/services/interfaces/IExpenseService';
import { IFriendService } from '@/services/interfaces/IFriendService';
import { IGroupService } from '@/services/interfaces/IGroupService';
import { IMigrationService } from '@/services/interfaces/IMigrationService';

import { SupabaseAuthService } from '@/services/supabase/SupabaseAuthService';
import { SupabaseExpenseService } from '@/services/supabase/SupabaseExpenseService';
import { SupabaseFriendService } from '@/services/supabase/SupabaseFriendService';
import { SupabaseGroupService } from '@/services/supabase/SupabaseGroupService';
import { SupabaseMigrationService } from '@/services/supabase/SupabaseMigrationService';

export const authService: IAuthService = new SupabaseAuthService(supabase);
export const expenseService: IExpenseService = new SupabaseExpenseService(supabase);
export const friendService: IFriendService = new SupabaseFriendService(supabase);
export const groupService: IGroupService = new SupabaseGroupService(supabase);
export const migrationService: IMigrationService = new SupabaseMigrationService(supabase);
