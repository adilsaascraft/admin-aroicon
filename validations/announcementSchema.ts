import { z } from 'zod'

export const AnnouncementFormSchema = z.object({
  heading: z
    .string()
    .min(1, 'Heading is required and cannot be empty.')
    .max(100, 'Heading cannot exceed 100 characters. Keep it concise yet clear.'),
    
  description: z
    .string()
    .min(1, 'Description cannot be empty. Provide full details.')
    .max(10000, 'Description is too long. Limit to 10,000 characters.'),
    
  postedBy: z
    .string()
    .min(1, 'Posted By cannot be empty. Enter your name or role (e.g., Admin).')
    .max(30, 'Posted By must be 30 characters or fewer.')
})

export type AnnouncementFormValues = z.infer<typeof AnnouncementFormSchema>
