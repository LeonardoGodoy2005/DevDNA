import { getGithubUser } from "../modules/github/github.service.js";
import { getGithubRepositories } from "../modules/github/github.repositories.js";
import { analisarDesenvolvedor } from "../modules/dna/dna.analyzer.js";
export async function githubRoutes(app) {
    // Buscar informações do perfil do GitHub
    app.get("/github/:username", async (request, reply) => {
        const { username } = request.params;
        if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
            return reply.status(400).send({
                error: "Nome de usuário do GitHub inválido.",
            });
        }
        try {
            const user = await getGithubUser(username);
            return reply.send(user);
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Erro interno ao consultar o GitHub.";
            const statusCode = message.includes("não encontrado")
                ? 404
                : message.includes("Limite de consultas")
                    ? 429
                    : 502;
            return reply.status(statusCode).send({
                error: message,
            });
        }
    });
    app.get("/github/:username/repositories", async (request, reply) => {
        const { username } = request.params;
        if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
            return reply.status(400).send({
                error: "Nome de usuário do GitHub inválido.",
            });
        }
        try {
            const repositories = await getGithubRepositories(username);
            return reply.send({
                username,
                total: repositories.length,
                repositories,
            });
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Erro interno ao consultar os repositórios.";
            const statusCode = message.includes("não encontrado")
                ? 404
                : message.includes("Limite de consultas")
                    ? 429
                    : 502;
            return reply.status(statusCode).send({
                error: message,
            });
        }
    });
    app.get("/github/:username/dna", async (request, reply) => {
        const { username } = request.params;
        if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
            return reply.status(400).send({
                error: "Nome de usuário do GitHub inválido.",
            });
        }
        try {
            const repositories = await getGithubRepositories(username);
            const dna = analisarDesenvolvedor(repositories);
            return reply.send({
                username,
                dna,
            });
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Erro interno ao analisar o perfil.";
            const statusCode = message.includes("não encontrado")
                ? 404
                : message.includes("Limite de consultas")
                    ? 429
                    : 502;
            return reply.status(statusCode).send({
                error: message,
            });
        }
    });
}
//# sourceMappingURL=github.routes.js.map