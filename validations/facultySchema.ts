import { z } from 'zod';

export const FacultySchema = z.object({
  _id: z.string().optional(), // for Edit mode

  facultyName: z
    .string()
    .min(1, 'Faculty name cannot be empty.')
    .max(50, 'Faculty name cannot exceed 50 characters.'),

  email: z
    .string()
    .email('Please enter a valid email address.')
    .max(50, 'Email cannot exceed 50 characters.'),

  mobile: z
    .string()
    .min(6, 'Mobile number must be atleast 6 digits.')
    .max(10, 'Mobile number can not be exceed 15 digits.')
    .regex(/^\d{15}$/, 'Mobile number must contain only digits.'),
});

export type FacultyValues = z.infer<typeof FacultySchema>;
