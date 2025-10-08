import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
    supabase,
    // You can add more context items here like database connections, auth, etc.
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // In production, extract and verify JWT token from Authorization header
  const authHeader = ctx.req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For development, use mock user
    const user = {
      id: 'user_123',
      name: 'John Farmer',
      email: 'john@farmer.com',
      role: 'vendor',
      phone: '+254705256259',
      location: 'Nairobi, Kenya',
      verified: true,
      subscription_tier: 'Gold'
    };
    
    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  }
  
  // In production, verify the JWT token here
  // const token = authHeader.substring(7);
  // const { data: { user }, error } = await ctx.supabase.auth.getUser(token);
  // if (error || !user) {
  //   throw new Error('Unauthorized');
  // }
  
  const user = {
    id: 'user_123',
    name: 'John Farmer',
    email: 'john@farmer.com',
    role: 'vendor',
    phone: '+254705256259',
    location: 'Nairobi, Kenya',
    verified: true,
    subscription_tier: 'Gold'
  };
  
  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});