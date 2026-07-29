import { handlers } from '@/auth';

/**
 * NextAuth route handler.
 * Exposes GET and POST for all /api/auth/* routes.
 * Type cast needed to satisfy Next.js 16's strict route handler typing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = handlers.GET as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = handlers.POST as any;
