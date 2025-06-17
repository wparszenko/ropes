export default {
  expo: {
    name: "Tangle Escape",
    slug: "tangle-escape",
    version: "1.0.0",
    sdkVersion: "52.0.30",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "tangle-escape",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "nativewind/babel"
    ],
    experiments: {
      typedRoutes: true
    },
    runtimeVersion: {
      policy: "sdkVersion"
    }
  }
};