import { z } from 'zod';

export const TeamFormSchema = z.object({
  _id: z.string().optional(), // For Edit mode

  name: z
    .string()
    .min(1, 'Name cannot be empty.')
    .max(50, 'Name cannot exceed 50 characters.'),

  email: z
    .string()
    .email('Please enter a valid email address.')
    .max(50, 'Email cannot exceed 50 characters.'),

  mobile: z
    .string()
    .min(10, 'Mobile number must be 10 digits.')
    .max(10, 'Mobile number must be 10 digits.')
    .regex(/^\d{10}$/, 'Mobile number must contain only digits.'),
});

export type TeamFormValues = z.infer<typeof TeamFormSchema>;
