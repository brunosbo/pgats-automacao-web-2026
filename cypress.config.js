const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/html',
    reportTitle: 'Automation Exercise - Cypress',
    reportPageTitle: 'Resultados dos testes',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveJson: true,
  },
  viewportWidth: 1440,
  viewportHeight: 900,
  defaultCommandTimeout: 15000,
  pageLoadTimeout: 90000,
  video: false,
  e2e: {
    baseUrl: 'https://automationexercise.com',
    testIsolation: true,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },
});
