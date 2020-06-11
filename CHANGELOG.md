# Changelog
This document contains the releases and what changed between them.
If you got any doubts don't hesitate to ask me a question.

## **v1.0.0** 2020-06-11
### Breaking Changes:
- Contexts:
  - Had the state (introduced in v9.1) removed

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