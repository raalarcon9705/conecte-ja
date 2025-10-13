import { z } from 'zod';

// Account mode types
export type AccountMode = 'client' | 'professional';
export type UserType = 'client' | 'professional' | 'both';

export const loginSchema = z.object({
  email: z
    .string({ message: 'auth.login.errors.emailRequired' })
    .min(1, { message: 'auth.login.errors.emailRequired' })
    .email({ message: 'auth.login.errors.emailInvalid' }),
  password: z
    .string({ message: 'auth.login.errors.passwordRequired' })
    .min(6, { message: 'auth.login.errors.passwordMinLength' }),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, { message: 'auth.register.errors.nameRequired' }),
    email: z
      .string({ message: 'auth.register.errors.emailRequired' })
      .min(1, { message: 'auth.register.errors.emailRequired' })
      .email({ message: 'auth.register.errors.emailInvalid' }),
    password: z
      .string({ message: 'auth.register.errors.passwordRequired' })
      .min(6, { message: 'auth.register.errors.passwordMinLength' }),
    confirmPassword: z
      .string({ message: 'auth.register.errors.confirmPasswordRequired' })
      .min(6, { message: 'auth.register.errors.passwordMinLength' }),
    userType: z.enum(['client', 'professional'], {
      message: 'auth.register.errors.userTypeRequired',
    }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'auth.register.errors.acceptTermsRequired',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.register.errors.passwordsDoNotMatch',
    path: ['confirmPassword'],
  });

export const passwordRecoverySchema = z.object({
  email: z
    .string({ message: 'auth.passwordRecovery.errors.emailRequired' })
    .min(1, { message: 'auth.passwordRecovery.errors.emailRequired' })
    .email({ message: 'auth.passwordRecovery.errors.emailInvalid' }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type PasswordRecoverySchema = z.infer<typeof passwordRecoverySchema>;
