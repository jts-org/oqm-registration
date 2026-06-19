# Backend Instructions (gas/)

Nämä ohjeet ovat tiimille.  
Copilotin käyttäytymistä ohjaavat `.github/skills/*` SKILL.md -tiedostot.

## Local development & CLASP
- Käytä CLASPia paikalliseen kehitykseen:
  - `clasp login`
  - `clasp push`
  - `clasp version`
- **Älä käytä `clasp deploy`** — Web App julkaistaan Apps Script UI:sta (Publish → Deploy as web app).

## Web App structure
- Backend käyttää `doGet(e)` ja `doPost(e)` -entrypointteja.
- Kaikkien vastausten tulee olla JSON-muotoisia (`ContentService.createTextOutput(JSON.stringify(...))`).
- API-sopimus ja payload-rakenne on määritelty `wire-react-to-gas` -taidossa.

## Secrets & configuration
- Kaikki salaisuudet ja asetukset tallennetaan Script Propertiesiin.
- Älä koskaan kovakoodaa salasanoja, Sheet ID:tä tai Web App -URL:ia.
- Katso tarkemmat säännöt: `.github/skills/security-secrets`.

## Concurrency & atomic operations
- Kaikki kirjoitusoperaatiot Sheetsiin tulee olla atomisia.
- Käytä **vain** `LockService.getScriptLock().tryLock(5000)` -mallia.
- Älä käytä `waitLock()`.
- Vapauta lukko aina `finally`-lohkon sisällä.
- Katso tarkemmat säännöt: `.github/skills/gas-locking-and-concurrency`.

## Sheet operations
- Noudata skeemaa ja sarakejärjestystä.
- Älä kirjoita osittaisia rivejä.
- Älä tee appendRow-operaatioita ilman lukkoa.
- Katso tarkemmat säännöt: `.github/skills/gas-sheet-operations` ja `.github/skills/sheet-schema`.

## Error handling
- Kaikkien virheiden tulee palautua muodossa:
  - `{ ok: false, error: "<error_code>" }`
- Älä koskaan palauta stack tracea tai raakaa poikkeusta.
- Katso virhekoodit: `.github/skills/gas-error-handling`.

## Response format
- Onnistuneet vastaukset:
  - `{ ok: true, data: ... }`
- Katso tarkemmat säännöt: `.github/skills/gas-response-format`.

## Route registry
- Backend-reitit ja niiden access levelit on määritelty:
  - `.github/skills/gas-route-registry`

## See also
- `.github/skills/gas-backend-architecture`
- `.github/skills/security-secrets`
- `.github/skills/auth-flow`
- `.github/skills/gas-locking-and-concurrency`
- `.github/skills/gas-sheet-operations`
- `.github/skills/gas-error-handling`
- `.github/skills/gas-response-format`

---