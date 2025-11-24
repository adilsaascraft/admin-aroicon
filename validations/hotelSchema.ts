import { z } from "zod";

export const HotelSchema = z.object({
  _id: z.string().optional(), // for edit mode

  facultyName: z
    .string()
    .min(1, "Faculty name is required."), // coming from dropdown

    hotelName: z
    .string()
    .min(1, "Hotel Name is required.")
    .max(50, "Hotel name cannot exceed 50 characters."),

  checkInDate: z
    .string()
    .min(1, "Checkin date is required.")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format."
    ),
    checkOutDate: z
    .string()
    .min(1, "Checkout date is required.")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format."
    ),

  
});

export type HotelValues = z.infer<typeof HotelSchema>;
