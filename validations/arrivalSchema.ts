import { z } from "zod";

export const ArrivalSchema = z.object({
  _id: z.string().optional(), // for edit mode

  facultyName: z
    .string()
    .min(1, "Faculty name is required."), // coming from dropdown

  arrivalDate: z
    .string()
    .min(1, "Arrival date is required.")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format."
    ),

  arrivalTime: z
    .string()
    .min(1, "Arrival time is required.")
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in HH:MM format."
    ),

  arrivalFlightDetail: z
    .string()
    .min(1, "Flight number is required.")
    .max(20, "Flight number cannot exceed 20 characters."),
});

export type ArrivalValues = z.infer<typeof ArrivalSchema>;
