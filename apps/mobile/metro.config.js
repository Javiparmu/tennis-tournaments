// Metro config for the Expo app inside the pnpm monorepo.
// - watchFolders + nodeModulesPaths let Metro resolve the workspace root and the
//   symlinked @courtrank/core package.
// - unstable_enablePackageExports lets Metro read @courtrank/core's "exports".
// - resolveRequest pins the React singletons to this app's copies.
// - withNativeWind wires the Tailwind/global.css pipeline.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.unstable_enablePackageExports = true;

// apps/web pins react 19.2.4 and this app pins 19.1.0, so pnpm's hoisted layout puts
// web's copy at the workspace root and gives every RN package that wants 19.1.0 its own
// nested copy. Metro keys the module registry by resolved path, so those copies load as
// separate React instances and any hook call throws "Invalid hook call". Resolving these
// specifiers from the app root collapses them onto one instance each.
const SINGLETONS = new Set(["react", "react-dom", "react-native"]);
const singletonOrigin = path.join(projectRoot, "metro.config.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SINGLETONS.has(moduleName.split("/")[0])) {
    return context.resolveRequest(
      { ...context, originModulePath: singletonOrigin },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
