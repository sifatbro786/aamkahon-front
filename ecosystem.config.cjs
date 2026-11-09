// pm2 process for the storefront + admin (Next.js) on the VPS.
// ONE instance in fork mode: Cache Components keeps its cache in memory.
module.exports = {
    apps: [
        {
            name: "amkahon-front",
            script: "node_modules/next/dist/bin/next",
            args: "start -p 3000",
            exec_mode: "fork",
            instances: 1,
            env: { NODE_ENV: "production" },
            max_memory_restart: "700M",
        },
    ],
};
