import * as z from "zod";

export const HotelFormSchema = z.object({
  hotelName: z
    .string()
    .min(1, "Hotel name cannot be empty.")
    .max(100, "Hotel name cannot exceed 100 characters."),

  hotelAddress: z
    .string()
    .min(1, "Hotel address cannot be empty.")
    .max(100, "Hotel address cannot exceed 100 characters."),

  hotelImage: z
    .any()
    .refine((file) => file?.length === 1, "Please upload a hotel image.")
    .refine((file) => file?.[0]?.type?.startsWith("image/"), "File must be a valid image."),

  country: z
    .string()
    .min(1, "Country is required.")
    .max(50, "Country cannot exceed 50 characters."),

  state: z
    .string()
    .min(1, "State is required.")
    .max(50, "State cannot exceed 50 characters."),

  city: z
    .string()
    .min(1, "City is required.")
    .max(50, "City cannot exceed 50 characters."),

  hotelCategory: z
    .string()
    .min(1, "Hotel category is required.")
    .max(50, "Hotel category cannot exceed 50 characters."),

  status: z
    .string()
    .min(1, "Status is required.")
    .max(50, "Status cannot exceed 50 characters."),

  // Optional but must be valid if provided
  website: z
    .string()
    .url("Enter a valid website URL.")
    .max(50, "Website URL cannot exceed 50 characters.")
    .optional()
    .or(z.literal("")),

  googleMapLink: z
    .string()
    .min(1, "Google Map link cannot be empty.")
    .max(200, "Google Map link cannot exceed 200 characters.")
    .url("Enter a valid Google Map URL.")
    .optional()
    .or(z.literal("")),

  distanceFromAirport: z
    .string()
    .min(1, "Distance from airport is required.")
    .max(50, "Distance from airport cannot exceed 50 characters."),

  distanceFromRailwayStation: z
    .string()
    .min(1, "Distance from railway station is required.")
    .max(50, "Distance from railway station cannot exceed 50 characters."),

  nearestMetroStation: z
    .string()
    .min(1, "Nearest metro station is required.")
    .max(50, "Nearest metro station cannot exceed 50 characters."),
});

export type HotelFormValues = z.infer<typeof HotelFormSchema>;
