import { draftSchema, type Draft, type ListingPreferences, type Property } from '@finca/domain';
import { type DraftRepository } from './ports/draft-repository';
export type SaveDraftCommand = {
  property: Property;
  preferences: ListingPreferences;
  text: string;
  existingId?: string;
};
export class SaveDraft {
  constructor(
    private readonly repository: DraftRepository,
    private readonly createId: () => string,
    private readonly now: () => Date,
  ) {}
  async execute(command: SaveDraftCommand): Promise<Draft> {
    const previous = command.existingId
      ? (await this.repository.list()).find((draft) => draft.id === command.existingId)
      : undefined;
    if (command.existingId && !previous)
      throw new Error('El borrador ya no existe. Guarda el texto como un anuncio nuevo.');
    const date = this.now().toISOString();
    const draft = draftSchema.parse({
      schemaVersion: 1,
      id: previous?.id ?? this.createId(),
      name: previous?.name ?? `Vivienda en ${command.property.city}`,
      property: command.property,
      preferences: command.preferences,
      text: command.text,
      createdAt: previous?.createdAt ?? date,
      updatedAt: date,
      source: 'example',
    });
    await this.repository.put(draft);
    return draft;
  }
}
