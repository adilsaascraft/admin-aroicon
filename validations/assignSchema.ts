import { z } from "zod";
import { items } from "@/lib/constants";

export const AssignFormSchema = z.object({
  _id: z.string().optional(), // for Edit mode

  eventId: z
    .string()
    .min(1, "Please select an event.")
    .max(50, "Event selection cannot exceed 50 characters."),

  eventAdminId: z
    .string()
    .min(1, "Please select a team or admin.")
    .max(50, "Team/Admin selection cannot exceed 50 characters."),
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one module.",
  }),
});

export type AssignFormValues = z.infer<typeof AssignFormSchema>;
