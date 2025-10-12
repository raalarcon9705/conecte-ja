import { z } from 'zod';

export const loginSchema = z.object({
    email: z
      .string({ message: 'auth.login.errors.emailRequired' })
      .min(1, { message: 'auth.login.errors.emailRequired' })
      .email({ message: 'auth.login.errors.emailInvalid' }),
    password: z
      .string({ message: 'auth.login.errors.passwordRequired' })
      .min(6, { message: 'auth.login.errors.passwordMinLength' }),
  });

export type LoginSchema = z.infer<typeof loginSchema>;
