import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import globals from "globals";


export default [
  // {env:{jest:true, node:true}},
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];