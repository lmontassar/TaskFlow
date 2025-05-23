// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/',
    specPattern: 'cypress/e2e/**/*.{js,ts}',
    // point supportFile to the actual file
    supportFile: 'cypress/support/e2e.ts',
  },
})