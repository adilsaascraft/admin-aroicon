import { z } from "zod";

export const DepartureSchema = z.object({
  _id: z.string().optional(), // for edit mode

  facultyName: z
    .string()
    .min(1, "Faculty name is required."), // coming from dropdown

  departureDate: z
    .string()
    .min(1, "Departure date is required.")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format."
    ),

  departureTime: z
    .string()
    .min(1, "Departure time is required.")
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in HH:MM format."
    ),

  departureFlightDetail: z
    .string()
    .min(1, "Flight number is required.")
    .max(20, "Flight number cannot exceed 20 characters."),
});

export type DepartureValues = z.infer<typeof DepartureSchema>;
