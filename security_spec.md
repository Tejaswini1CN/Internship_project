# Data Invariants

1. Anyone authenticated can read events. Only admins can create/update/delete events (for now, admin = false or hardcoded email, but we'll say `isValidEvent`).
2. Anyone authenticated can read global helpdesk reports (it's a public fair helpdesk).
3. Authenticated users can create helpdesk reports. They must be the `ownerId`.
4. Only the owner or an admin can update the report's status or details.
5. All IDs must be numeric strings (since we use Date.now()).

# The "Dirty Dozen" Payloads
1. Create report without required fields -> FAIL
2. Create report with wrong ownerId -> FAIL
3. Update report when not owner -> FAIL
4. Update report changing ownerId -> FAIL
5. Update report changing status to invalid type -> FAIL
6. Create report with 1MB string -> FAIL
7. Create event as non-admin -> FAIL
8. Empty user payload -> FAIL
9. ...

# The Test Runner
A complete firestore.rules.test.ts.
