import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

import common from "./locales/fr/common.json";
import home from "./locales/fr/home.json";
import survey from "./locales/fr/survey.json";
import assistant from "./locales/fr/assistant.json";
import candidates from "./locales/fr/candidates.json";
import comparison from "./locales/fr/comparison.json";
import onboarding from "./locales/fr/onboarding.json";

const deviceLanguage = getLocales()[0]?.languageCode ?? "fr";

i18n.use(initReactI18next).init({
  lng: deviceLanguage.startsWith("fr") ? "fr" : "fr", // French-only for MVP
  fallbackLng: "fr",
  defaultNS: "common",
  ns: ["common", "home", "survey", "assistant", "candidates", "comparison", "onboarding"],
  resources: {
    fr: {
      common,
      home,
      survey,
      assistant,
      candidates,
      comparison,
      onboarding,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
