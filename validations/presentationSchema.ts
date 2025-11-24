import { z } from "zod";

export const PresentationSchema = z.object({
  _id: z.string().optional(), // for edit mode

  facultyName: z
    .string()
    .min(1, "Faculty name is required."), // coming from dropdown

  presentationTopicName: z
    .string()
    .min(1, "Presentation topic is required.")
    .max(100, "Presentation topic cannot exceed 100 characters."),

  presentationDate: z
    .string()
    .min(1, "Presentation date is required.")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format."
    ),

  presentationStartTime: z
    .string()
    .min(1, "Presentation start time is required.")
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in HH:MM format."
    ),

  presentationEndTime: z
    .string()
    .min(1, "Presentation end time is required.")
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in HH:MM format."
    ),
});

export type PresentationValues = z.infer<typeof PresentationSchema>;
