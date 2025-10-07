import { publicProcedure } from '@/backend/trpc/create-context';

export const healthCheckProcedure = publicProcedure
  .query(async ({ ctx }) => {
    console.log('🏥 Health check requested');

    try {
      // Test database connection
      const { error: dbError } = await ctx.supabase
        .from('users')
        .select('count')
        .limit(1);

      const dbStatus = dbError ? 'error' : 'healthy';
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          database: {
            status: dbStatus,
            error: dbError?.message || null
          },
          api: {
            status: 'healthy'
          }
        },
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      };

    } catch (error) {
      console.error('❌ Health check failed:', error);
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          database: {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          api: {
            status: 'healthy'
          }
        },
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      };
    }
  });