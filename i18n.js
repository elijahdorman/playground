// const supportedLocals = ["en_US", "fr_CA"];

var store = null;
var locale = "en_US";
var channelLocale = "en_US";
var i18nTranslations = {
  en_US: {},
};

//TODO: dateTime formatting: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
//TODO: number formatting:   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
export var formatNumber = (number, loc = locale) => {
  switch (loc) {
    case "en_US":
      return number;

    case "fr_CA":
      return number;

    default:
      throw Error(`no number formatting available for the "${loc}" locale`);
  }
};

//TODO: add support for channelLocale
export var __ = (name, loc = locale) => {
  if (i18nTranslations[loc] && i18nTranslations[loc][name]) {
    return i18nTranslations[loc][name];
  }
  if (i18nTranslations[locale] && i18nTranslations[locale][name]) {
    return i18nTranslations[locale][name];
  }
  if (i18nTranslations.en_US && i18nTranslations.en_US[name]) {
    return i18nTranslations.en_US[name];
  }
  console.error(`The translation for "${name}" is not available in any language.
  Either it needs to be added to the translations
  or the file has not loaded yet for some reason`);

  return "No Translation Available";
};

//This is for TESTING ONLY. Use sagas for normal language loading
export var addTranslation = (name, translation) => (i18nTranslations[name] = translation);

export var setupI18n = store => {
  store.subscribe(() => {
    var data = store.getState();
    locale = data.user.locale;
    i18nTranslations = data.i18n;
    channelLocale = data.channels[data.currentChannel].locale;
  });
};

export default __;
