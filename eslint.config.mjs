import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
    ...nextVitals,
    // The admin is ported as-is from the Footpath Vite app, which predates the
    // React Compiler lint rules. Its fetch-in-effect pattern is intentional
    // there; keep these visible as warnings instead of rewriting 15k lines.
    {
        files: ["admin/src/**"],
        rules: {
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/static-components": "warn",
            "react/no-unescaped-entities": "warn",
        },
    },
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
    ]),
]);

export default eslintConfig;
