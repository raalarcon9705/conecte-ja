import { loginSchema } from './schemas';

describe('loginSchema', () => {
  const t = (key: string) => key;

  it('should validate a correct login form', () => {
    const schema = loginSchema(t);
    const result = schema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should fail if email is invalid', () => {
    const schema = loginSchema(t);
    const result = schema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe('auth.login.errors.emailInvalid');
  });

  it('should fail if password is too short', () => {
    const schema = loginSchema(t);
    const result = schema.safeParse({
      email: 'test@example.com',
      password: '123',
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe('auth.login.errors.passwordMinLength');
  });
});