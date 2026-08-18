# DCS-UiLayer-Components

Scaffolded by **DCS Input Profile Importer** (DCS-Common).

| Identity | Value |
| --- | --- |
| Display name | UiLayer |
| DCS input module | `UiLayer` |
| Kneeboard folder | Saved Games `Kneeboard` root |

## Local build

```bash
npm ci
export DCS_COMMON_ROOT=/path/to/DCS-Common   # or checkout at .dcs-common
npm run build:kneeboard
npm run test:kneeboard
```

Review `SCAFFOLD-REPORT.md` and refine `config/kneeboard.json` before the first release.

See DCS-Common [consumer-repository-setup.md](https://github.com/ScottyMac52/DCS-Common/blob/main/docs/consumer-repository-setup.md).
