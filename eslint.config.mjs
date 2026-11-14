import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
    ...nextVitals,
    // The admin is ported as-is from the Footpath Vite app, which predates the
    // React Compiler lint rules.
    //  - set-state-in-effect: its `useEffect(() => { load() }, [load])` fetch
    //    pattern is intentional (client-only SPA, no SSR), so the rule is off
    //    here instead of rewriting every page. Storefront code keeps it on.
    //  - no-img-element: admin thumbnails are backend uploads shown at small
    //    sizes; next/image adds nothing there.
    {
        files: ["admin/src/**"],
        rules: {
            "react-hooks/set-state-in-effect": "off",
            "@next/next/no-img-element": "off",
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
