import { z } from 'zod';
export const operationValues = ['sale', 'rent'] as const;
export const propertyTypeValues = ['flat', 'house', 'penthouse'] as const;
export const conditionValues = ['unknown', 'good', 'renovated', 'needs-renovation'] as const;
export const extraValues = ['terrace', 'lift', 'garage', 'storage', 'garden', 'pool'] as const;
export const propertySchema = z
  .object({
    operation: z.enum(operationValues),
    type: z.enum(propertyTypeValues),
    city: z.string().trim().min(1).max(80),
    price: z.number().positive().max(100_000_000),
    areaM2: z.number().positive().max(100_000),
    bedrooms: z.number().int().min(0).max(100),
    bathrooms: z.number().int().min(0).max(100),
    condition: z.enum(conditionValues),
    extras: z
      .array(z.enum(extraValues))
      .max(extraValues.length)
      .refine((values) => new Set(values).size === values.length),
    notes: z.string().trim().max(600),
  })
  .strict();
export type Property = z.infer<typeof propertySchema>;
export type PropertyField = keyof Property;
export type ValidationResult =
  { ok: true; value: Property } | { ok: false; fields: PropertyField[] };
export function parseProperty(input: unknown): ValidationResult {
  const result = propertySchema.safeParse(input);
  if (result.success) return { ok: true, value: result.data };
  const fields = [
    ...new Set(
      result.error.issues
        .map((issue) => issue.path[0])
        .filter(
          (key): key is PropertyField => typeof key === 'string' && key in propertySchema.shape,
        ),
    ),
  ];
  return { ok: false, fields };
}
