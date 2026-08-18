# OpenKneeboard

The package installs the generated PNG pages directly under the Saved Games `Kneeboard` root. DCS treats pages in this directory as global, so the UI Layer references appear in the standard kneeboard for every aircraft instead of being isolated in a non-aircraft `UiLayer` directory.

OpenKneeboard users can consume the same global Saved Games kneeboard content through its DCS integration; a separate `Kneeboard\UiLayer` Folder tab is neither created nor required.

The page is generated from the committed MFD source image and the machine-readable reservation manifest. It shows the ten current MFD 3 commands, both supported modifier paths, and the intentional Option 3 warning.

Run `npm run build:kneeboard` after changing the manifest. `npm run test:kneeboard` verifies dimensions, source consistency, and required callouts.
