async function configureSidePanel(): Promise<void> {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (error: unknown) {
    console.error('FINCA could not configure the side panel.', error);
  }
}
chrome.runtime.onInstalled.addListener(() => void configureSidePanel());
chrome.runtime.onStartup.addListener(() => void configureSidePanel());
void configureSidePanel();
