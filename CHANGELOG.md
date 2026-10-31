# Changelog
This document contains the releases and what changed between them.
If you got any doubts don't hesitate to ask me a question.

## **v0.9.2** 2026-10-31
### New:
- Context:
  - Now emits a `state` event whenever `setContextState` changes the state, realizing the library's own design (an event represents the modification to context state). The event carries `{ context, state, changed }`.
- EventManager:
  - `removeProcedure()` added as a documented alias for `removeBirbable()`, closing the documented-vs-implemented gap.
  - `addBirbable` / `removeBirbable` / `removeProcedure` now no-op instead of throwing when the context was never registered.

### Maintenance:
- Toolchain: upgraded the TypeScript, mocha, chai, and ESLint toolchain to clear `npm audit` (0 vulnerabilities), migrating ESLint to flat config.
- Docs: aligned the README API reference with the code, completed the truncated `setContextState` doc, and fixed the `pratical-examples/messaging-js` example so it runs end-to-end against the shipped API.

------
## **v0.9.1** 2020-04-08
### New:
- Context:
  - Contexts now carry a state that can be acessed and modified.

------
## **v0.8.1** 2020-03-14
### Small changes:
- Context:
  - Now it is possible to set the errorHandler in runtime

------
## **v0.8.0** 2020-03-13
### Breaking Changes:
- Pipeline:
  - No longer has the option to catch errors, this is now handled by the context

- Context:
  - No longer uses node's events to handle execution of the procedures, It is now handled internally.
  - Now has an extra property to handle uncaught exceptions of Procedures
  - The `.trigger()` method now has a different signature to accept an exception handler function.

- Manager:
  - Contract radically changed for `.broadcast()` function, now follows the Context's `.trigger()` method.

### Other Changes:
- Birbables:
  - Had a slight change to the `.execute()` method Type. Now the type of the descriptable in the `.execute()` method is propagated through the function.

------
## **v0.7.0** 2020-02-28
### Bugfix:
- BroadcastRecorder: Reading now stops at the maximum reading offset
- Write event on BroadcastRecorder is now dispatched after the context has already been modified by the procedures

------
## **v0.7.0-rc2** 2020-02-18
- BroadcastRecorder now supports event listeners

------
## **v0.7.0-rc1** 2020-02-18
- Added BroadcastRecorder entity.
- Added Broadcasts property on the EventManager.
- Updated Typescript Version to ^3.7.4.

------
## **v0.6.1** 2020-01-27
- Contexts now can have `symbol` as an identifier.

------
## **v0.6.0** 2020-01-27
This is the start of this document. There was a complete overhaul of the project, and this is the first stable version! :D