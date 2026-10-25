import { provideBrowserGlobalErrorListeners, Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AssistantComponent } from '@finca/ui';
@Component({
  selector: 'finca-root',
  standalone: true,
  imports: [AssistantComponent],
  template: '<finca-assistant environment="extension" />',
})
class App {}
bootstrapApplication(App, { providers: [provideBrowserGlobalErrorListeners()] }).catch(
  (error: unknown) => console.error(error),
);
