import { listingTextSchema, parseProperty, preferencesSchema } from '@finca/domain';
import { type ListingGenerator } from './ports/listing-generator';
export class GenerateListing {
  constructor(private readonly generator: ListingGenerator) {}
  async execute(input: unknown, preferences: unknown): Promise<string> {
    const result = parseProperty(input);
    if (!result.ok) throw new Error('La ficha contiene datos no válidos.');
    const settings = preferencesSchema.parse(preferences);
    return listingTextSchema.parse(await this.generator.generate(result.value, settings));
  }
}
