# OpenKneeboard

The package installs a 1200×1600 PNG under `KNEEBOARD\UiLayer`. Because UI Layer is not an aircraft module, add that directory to OpenKneeboard as a Folder tab rather than expecting it in the DCS Aircraft tab.

The page is generated from the committed MFD source image and the machine-readable reservation manifest. It shows the ten current MFD 3 commands, both supported modifier paths, and the intentional Option 3 warning.

Run `npm run build:kneeboard` after changing the manifest. `npm run test:kneeboard` verifies dimensions, source consistency, and required callouts.

