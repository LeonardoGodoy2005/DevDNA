import Fastify from "fastify";
import cors from "@fastify/cors";
import { githubRoutes } from "./routes/github.routes.js";
const app = Fastify({
    logger: true,
});
async function start() {
    await app.register(cors, {
        origin: true,
    });
    app.get("/health", async () => {
        return {
            status: "ok",
            service: "devdna",
        };
    });
    await app.register(githubRoutes);
    const port = Number(process.env.PORT) || 3333;
    try {
        await app.listen({
            port,
            host: "0.0.0.0",
        });
        console.log(`DevDNA running on http://localhost:${port}`);
    }
    catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=app.js.map