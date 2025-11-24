import { z } from "zod";

export const SessionSchema = z.object({
  _id: z.string().optional(), // for edit mode

  facultyName: z
    .string()
    .min(1, "Faculty name is required."), // coming from dropdown

    sessionTopicName: z
    .string()
    .min(1, "Session topic is required.")
    .max(100, "Session topic cannot exceed 100 characters."),

  sessionDate: z
    .string()
    .min(1, "Session date is required.")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format."
    ),

  sessionStartTime: z
    .string()
    .min(1, "Session start time is required.")
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in HH:MM format."
    ),
    sessionEndTime: z
    .string()
    .min(1, "Session end time is required.")
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in HH:MM format."
    ),

  
});

export type SessionValues = z.infer<typeof SessionSchema>;
