# Security Policy

## Secrets
- No secrets in repo or client code.
- GAS Script Properties: set `SHEET_ID`, `COACH_PASSWORD`, `ADMIN_PASSWORD`.
- Consider Google Cloud Secret Manager for highly sensitive data.

## Auth model
- Frontend does not store shared API secrets.
- Coach/admin access uses short-lived session tokens issued by GAS login routes.

## Reporting
- Create a private security advisory if you discover vulnerabilities.
