# FINCA engineering instructions

- Commit identity: Santiago García <sgarciajerez@gmail.com>. Configure it locally, never globally.
- Work from develop on feature/<descriptive-name> or fix/<descriptive-name>.
- Finish a coherent increment, run npm run verify, commit and merge with --no-ff into develop. Push feature and develop branches.
- master contains the approved baseline. Do not merge development into master until a stable release is explicitly agreed with the user.
- Preserve designs/ as the reviewed visual reference. Build the application in apps/ and reusable code in packages/.
- Keep domain independent from Angular, Express and Chrome; cases of use depend on small ports. Infrastructure implements those ports.
- Unit tests use explicit // Arrange, // Act and // Assert sections. Test observable behavior, boundary conditions and failures.
- Use Vitest for unit/integration and Playwright for E2E. Never hide missing tests with passWithNoTests or skipped mandatory checks.
- Keep TypeScript strict, native accessible controls, visible labels and reduced-motion support.
- Update README and CHANGELOG with each meaningful increment. Distinguish local deterministic generation from real AI.
- No credentials in client code, committed files, fixtures or logs. Do not claim support for portals until it has been validated.
