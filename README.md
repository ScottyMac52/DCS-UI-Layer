# DCS-UI-Layer (retired)

> [!IMPORTANT]
> This standalone consumer and OVGME package are retired. The repository is preserved as a read-only historical archive and should not receive new features or releases.

## Supported architecture

[DCS-Common](https://github.com/ScottyMac52/DCS-Common) now owns the definitive UI Layer catalog, shared profiles, modifiers, hardware mappings, overlays, and editing workflow.

Aircraft/component repositories consume DCS-Common during their builds. Each module package projects only the UI Layer devices, functions, instances, and modifier layers that the module actually utilizes. Do not install this repository's former all-inclusive package alongside those module packages.

## Historical material

Existing source, tags, releases, and generated artifacts remain available for rollback and historical reference. They are no longer supported distribution artifacts.

For current development and authoring, use:

- [Definitive UI Layer workflow](https://github.com/ScottyMac52/DCS-Common/blob/main/docs/definitive-ui-layer.md)
- [Shared UI Layer overlays](https://github.com/ScottyMac52/DCS-Common/blob/main/docs/ui-layer-overlays.md)
- [DCS Input Profile Importer](https://github.com/ScottyMac52/DCS-Common/tree/main/tools/DcsConsumerScaffold)
