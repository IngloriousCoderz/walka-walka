// Only the framework-free helpers: "client" also loads React's and Preact's
// typings, whose global JSX would replace Inglorious's.
/// <reference types="vite-plugin-pwa/vanillajs" />
import { isNative } from "@inglorious/web/native"
import { registerSW } from "virtual:pwa-register"

// The PwaUpdate type in the store keeps the installed app on this worker's
// latest version.
if (!isNative()) registerSW()
