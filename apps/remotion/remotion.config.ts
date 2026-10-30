/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import path from "path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
// One public folder for the site and the videos, as in Remotion's React Router template: staticFile()
// resolves to the site root in the web app's <Player>, so the Studio and renders read the same files.
Config.setPublicDir(path.join(process.cwd(), "../web/public"));
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);
Config.overrideBundlerConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      "@shared": path.join(process.cwd(), "../../packages/shared/src"),
      "@api": path.join(process.cwd(), "../api/src"),
    },
  },
}));
