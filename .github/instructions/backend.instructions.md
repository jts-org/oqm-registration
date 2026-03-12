# Backend Instructions (gas/)
- Use CLASP for local dev & deployments (`clasp login`, `clasp push`, `clasp version`, `clasp deploy`).
- Web app must implement `doGet(e)` and/or `doPost(e)` and respond with JSON via `ContentService`.
- Store secrets/tokens in Script Properties; never hardcode.
- All operations that add/update/delete data must be atomic and handle concurrency (e.g. using LockService.getScriptLock(), LockService.waitLock() and Lock.releaseLock()).
