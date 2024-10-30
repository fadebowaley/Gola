const i18n = require('i18next');
const Backend = require("i18next-fs-backend"); 
const middleware = require('i18next-http-middleware');



// Configure i18next
i18n
.use(middleware.LanguageDetector) // Add LanguageDetector middleware
  .use(Backend)
  .init({
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en',
    preload: ['en', 'es', 'fr', 'de'],
    ns: ['common', 'home', 'cart', 'about', 'policy', 'profile', 'settings', 'contact'], // Add the 'home' namespace
  });

// Function to translate a key
function t(key, options) {
  return i18n.t(key, options);
}

module.exports = { i18n, t };
