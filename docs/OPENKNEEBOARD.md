# OpenKneeboard

The package installs a 1200×1600 PNG directly under the Saved Games `KNEEBOARD` root. DCS treats pages in this directory as global, so the UI Layer reference appears in the standard kneeboard for every aircraft instead of being isolated in a non-aircraft `UiLayer` directory.

OpenKneeboard users can consume the same global Saved Games kneeboard content through its DCS integration; a separate `KNEEBOARD\UiLayer` Folder tab is no longer required.

The page is generated from the committed MFD source image and the machine-readable reservation manifest. It shows the ten current MFD 3 commands, both supported modifier paths, and the intentional Option 3 warning.

Run `npm run build:kneeboard` after changing the manifest. `npm run test:kneeboard` verifies dimensions, source consistency, and required callouts.
