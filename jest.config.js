const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { defaults: tsjPreset } = require("ts-jest/presets");
const { compilerOptions } = require("./tsconfig");

module.exports = {
  preset: "@shelf/jest-dynamodb",
  transform: {
    ...tsjPreset.transform,
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  setupFiles: ["./jest-setup-env.js"],
};
