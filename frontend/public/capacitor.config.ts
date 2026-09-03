import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.godeyes.app",
  appName: "GOD EYES",
  webDir: "dist",
  server: {
    // While testing against a backend running on your own machine,
    // point this at your computer's LAN IP so the phone can reach it,
    // e.g. "http://192.168.1.20:4000". Leave unset once you deploy
    // the backend somewhere the phone can reach over the internet.
    // androidScheme: "https",
  },
};

export default config;
