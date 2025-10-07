import { supabase } from '@/lib/supabase';

interface SetupResult {
  success: boolean;
  message: string;
  details?: string;
}

export async function checkDatabaseSetup(): Promise<SetupResult> {
  try {
    console.log('🔍 Checking database setup...');
    
    // List of required tables
    const requiredTables = [
      'users',
      'products', 
      'orders',
      'favorites',
      'notifications',
      'disputes',
      'user_roles',
      'verification_requests',
      'subscriptions'
    ];
    
    const results: { table: string; exists: boolean; error?: string }[] = [];
    
    // Check each table
    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          results.push({ 
            table, 
            exists: false, 
            error: error.message 
          });
        } else {
          results.push({ table, exists: true });
        }
      } catch (err: any) {
        results.push({ 
          table, 
          exists: false, 
          error: err.message 
        });
      }
    }
    
    const missingTables = results.filter(r => !r.exists);
    const existingTables = results.filter(r => r.exists);
    
    if (missingTables.length === 0) {
      return {
        success: true,
        message: `✅ Database setup complete! All ${existingTables.length} tables found.`,
        details: `Tables: ${existingTables.map(t => t.table).join(', ')}`
      };
    }
    
    if (existingTables.length === 0) {
      return {
        success: false,
        message: '🚨 No database tables found. Please run the complete SQL schema.',
        details: `Missing tables: ${missingTables.map(t => t.table).join(', ')}`
      };
    }
    
    return {
      success: false,
      message: `⚠️ Partial database setup. ${missingTables.length} tables missing.`,
      details: `Missing: ${missingTables.map(t => t.table).join(', ')} | Found: ${existingTables.map(t => t.table).join(', ')}`
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: '❌ Failed to check database setup',
      details: error.message
    };
  }
}

export async function createTestUser(): Promise<SetupResult> {
  try {
    console.log('🧪 Creating test user...');
    
    const testUser = {
      user_id: 'test-user-' + Date.now(),
      full_name: 'Test User',
      email: 'test@banda.app',
      phone: '+254700000000',
      user_type: 'basic' as const,
      user_role: 'buyer' as const,
      tier: 'none' as const,
      verification_status: 'unverified' as const,
      subscription_status: 'none' as const,
      terms_accepted: true
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();
      
    if (error) {
      return {
        success: false,
        message: '❌ Failed to create test user',
        details: error.message
      };
    }
    
    // Clean up test user
    await supabase
      .from('users')
      .delete()
      .eq('user_id', testUser.user_id);
    
    return {
      success: true,
      message: '✅ Test user creation successful',
      details: `Created and deleted test user: ${data.full_name}`
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: '❌ Test user creation failed',
      details: error.message
    };
  }
}

export async function runDatabaseDiagnostics(): Promise<{
  connection: SetupResult;
  tables: SetupResult;
  testUser: SetupResult;
}> {
  console.log('🔧 Running complete database diagnostics...');
  
  // Test basic connection
  const connection = await (async (): Promise<SetupResult> => {
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      if (error) {
        return {
          success: false,
          message: '❌ Database connection failed',
          details: error.message
        };
      }
      return {
        success: true,
        message: '✅ Database connection successful'
      };
    } catch (err: any) {
      return {
        success: false,
        message: '❌ Database connection error',
        details: err.message
      };
    }
  })();
  
  // Check table setup
  const tables = await checkDatabaseSetup();
  
  // Test user operations (only if tables exist)
  const testUser = tables.success 
    ? await createTestUser()
    : {
        success: false,
        message: '⏭️ Skipped test user (tables missing)',
        details: 'Cannot test user operations without database tables'
      };
  
  return { connection, tables, testUser };
}