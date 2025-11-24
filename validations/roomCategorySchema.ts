import { z } from 'zod';

export const RoomCategoryFormSchema = z.object({
  _id: z.string().optional(), // for Edit mode

  hotel: z
    .string()
    .min(1, 'Hotel cannot be empty.')
    .max(50, 'Hotel name cannot exceed 50 characters.'),

  roomCategory: z
    .string()
    .min(1, 'Room category cannot be empty.')
    .max(30, 'Room category cannot exceed 30 characters.'),

  roomType: z
    .string()
    .min(1, 'Room type cannot be empty.')
    .max(30, 'Room type cannot exceed 30 characters.'),

  status: z
    .string()
    .min(1, 'Status is required.')
    .max(30, 'Status cannot exceed 30 characters.'),
});

export type RoomCategoryFormValues = z.infer<typeof RoomCategoryFormSchema>;
