import { TRPCError } from '@trpc/server';

export class BandaError extends Error {
  constructor(
    message: string,
    public code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR' = 'INTERNAL_SERVER_ERROR',
    public statusCode: number = 500
  ) {
    const sanitizedMessage = message?.trim()?.slice(0, 200) || 'Unknown error';
    super(sanitizedMessage);
    this.name = 'BandaError';
  }
}

export const handleTRPCError = (error: unknown): TRPCError => {
  if (error && typeof error === 'object') {
    try {
      const errorStr = JSON.stringify(error).slice(0, 500);
      console.error('🚨 TRPC Error:', errorStr);
    } catch {
      console.error('🚨 TRPC Error: [Unable to stringify error]');
    }
  }

  if (error instanceof BandaError) {
    return new TRPCError({
      code: error.code,
      message: error.message,
    });
  }

  if (error instanceof Error) {
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
    });
  }

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
};

export const validateUser = (user: any) => {
  if (!user || !user.id) {
    throw new BandaError('User not authenticated', 'UNAUTHORIZED', 401);
  }
  return user;
};

export const validateInput = (input: any, requiredFields: string[]) => {
  for (const field of requiredFields) {
    if (!input[field]) {
      throw new BandaError(`${field} is required`, 'BAD_REQUEST', 400);
    }
  }
};

export const logOperation = (operation: string, userId?: string, data?: any) => {
  if (!operation?.trim()) return;
  const sanitizedOperation = operation.trim().slice(0, 100);
  const timestamp = new Date().toISOString();
  let sanitizedData = '';
  if (data && typeof data === 'object') {
    try {
      sanitizedData = JSON.stringify(data).slice(0, 500);
    } catch {
      sanitizedData = '[Unable to stringify data]';
    }
  }
  console.log(`[${timestamp}] ${sanitizedOperation}${userId ? ` - User: ${userId}` : ''}${sanitizedData ? ` - Data: ${sanitizedData}` : ''}`);
};