import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localize from "react-native-localize";

import common from "./locales/fr/common.json";
import home from "./locales/fr/home.json";
import learn from "./locales/fr/learn.json";
import survey from "./locales/fr/survey.json";
import chatbot from "./locales/fr/chatbot.json";

const deviceLanguage = Localize.getLocales()[0]?.languageCode ?? "fr";

i18n.use(initReactI18next).init({
  lng: deviceLanguage.startsWith("fr") ? "fr" : "fr", // French-only for MVP
  fallbackLng: "fr",
  defaultNS: "common",
  ns: ["common", "home", "learn", "survey", "chatbot"],
  resources: {
    fr: {
      common,
      home,
      learn,
      survey,
      chatbot,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
