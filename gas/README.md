# GAS Backend

- `clasp push` to sync local → Apps Script; `clasp pull` for reverse.
- Version & deploy as a **web app**; copy the `/exec` URL for the frontend.

## Script Properties (Apps Script → Project Settings)
- `SHEET_ID`: target spreadsheet id
- `COACH_PASSWORD`: coach password for `coachLogin` password mode
- `ADMIN_PASSWORD`: admin password for `adminLogin`

## Public camp registration

`POST resolveCamp` resolves `{ camp }`; `POST registerTraineeBatchForCamp`
accepts the camp ID, selected schedule IDs and trainee identity. The backend
validates camp membership and date eligibility again under a script lock and
writes one `trainee_registrations` row per selected session in one batch.
See `wire-react-to-gas` for the full contract. No separate enrollment sheet
or record is used.
