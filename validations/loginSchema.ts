import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(20, { message: 'Password must not exceed 20 characters' }),
    robot: z.boolean().refine(v => v === true, { message: "Please verify you are a human" }),
})

export type LoginFormData = z.infer<typeof loginSchema>
