import { type ListingPreferences, type Property } from '@finca/domain';
import { type ListingGenerator } from './ports/listing-generator';
const types = { flat: 'Piso', house: 'Casa', penthouse: 'Ático' } as const;
const extras = {
  terrace: 'terraza',
  lift: 'ascensor',
  garage: 'garaje',
  storage: 'trastero',
  garden: 'jardín',
  pool: 'piscina',
} as const;
const states = {
  unknown: '',
  good: 'La vivienda se encuentra en buen estado.',
  renovated: 'La vivienda está reformada.',
  'needs-renovation': 'La vivienda necesita una reforma.',
} as const;
export class ExampleListingGenerator implements ListingGenerator {
  async generate(property: Property, preferences: ListingPreferences): Promise<string> {
    const format = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
    const operation = property.operation === 'sale' ? 'venta' : 'alquiler';
    const intro =
      preferences.tone === 'friendly'
        ? 'Tu próximo espacio empieza aquí. '
        : preferences.tone === 'editorial'
          ? 'Un espacio para vivir a tu manera. '
          : '';
    const summary = `${intro}${types[property.type]} en ${operation} en ${property.city}, con ${format.format(property.areaM2)} m², ${property.bedrooms} habitaciones y ${property.bathrooms} baños.`;
    const features = property.extras.length
      ? `Características confirmadas: ${property.extras.map((extra) => extras[extra]).join(', ')}.`
      : '';
    const price = `Precio de ${operation}: ${format.format(property.price)} €${property.operation === 'rent' ? ' al mes' : ''}.`;
    const paragraphs =
      preferences.length === 'brief'
        ? [summary, features, price]
        : [
            summary,
            states[property.condition],
            features,
            price,
            'Contacta para conocer más detalles y concertar una visita.',
          ];
    return paragraphs.filter(Boolean).join('\n\n');
  }
}
