import { z } from 'zod';
import { propertySchema } from './property';
export const preferencesSchema = z
  .object({
    tone: z.enum(['professional', 'friendly', 'editorial']),
    length: z.enum(['standard', 'brief']),
  })
  .strict();
export type ListingPreferences = z.infer<typeof preferencesSchema>;
export const listingTextSchema = z.string().trim().min(1).max(20000);
export const draftSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.uuid(),
    name: z.string().trim().min(1).max(100),
    property: propertySchema,
    preferences: preferencesSchema,
    text: listingTextSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    source: z.literal('example'),
  })
  .strict();
export type Draft = z.infer<typeof draftSchema>;
