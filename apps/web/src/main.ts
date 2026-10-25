import { provideBrowserGlobalErrorListeners, Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ExampleListingGenerator } from '@finca/application';
import { IndexedDbRecordStore, ValidatedDraftRepository } from '@finca/storage';
import { AssistantComponent, DRAFT_REPOSITORY, LISTING_GENERATOR } from '@finca/ui';
@Component({
  selector: 'finca-root',
  standalone: true,
  imports: [AssistantComponent],
  template: '<finca-assistant environment="web" />',
})
class App {}
bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LISTING_GENERATOR, useFactory: () => new ExampleListingGenerator() },
    {
      provide: DRAFT_REPOSITORY,
      useFactory: () => new ValidatedDraftRepository(new IndexedDbRecordStore()),
    },
  ],
}).catch((error: unknown) => console.error(error));
