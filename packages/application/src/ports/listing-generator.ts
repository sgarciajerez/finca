import { type ListingPreferences, type Property } from '@finca/domain';
export interface ListingGenerator {
  generate(property: Property, preferences: ListingPreferences): Promise<string>;
}
