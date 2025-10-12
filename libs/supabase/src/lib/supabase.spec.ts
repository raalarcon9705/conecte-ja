import { createClient, createAdminClient } from './supabase';

describe('supabase', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('createClient', () => {
    it('should throw error if SUPABASE_URL is not set', () => {
      delete process.env['SUPABASE_URL'];
      process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';

      expect(() => createClient()).toThrow('SUPABASE_URL environment variable is not set');
    });

    it('should throw error if SUPABASE_ANON_KEY is not set', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      delete process.env['SUPABASE_ANON_KEY'];

      expect(() => createClient()).toThrow('SUPABASE_ANON_KEY environment variable is not set');
    });

    it('should create a client when environment variables are set', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';

      const client = createClient();
      expect(client).toBeDefined();
    });
  });

  describe('createAdminClient', () => {
    it('should throw error if SUPABASE_URL is not set', () => {
      delete process.env['SUPABASE_URL'];
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-role-key';

      expect(() => createAdminClient()).toThrow('SUPABASE_URL environment variable is not set');
    });

    it('should throw error if SUPABASE_SERVICE_ROLE_KEY is not set', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      delete process.env['SUPABASE_SERVICE_ROLE_KEY'];

      expect(() => createAdminClient()).toThrow('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    });

    it('should create an admin client when environment variables are set', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-role-key';

      const client = createAdminClient();
      expect(client).toBeDefined();
    });
  });
});
