const GITHUB_API = "https://api.github.com";
export async function getGithubRepositories(username) {
    const repositories = [];
    const perPage = 100;
    for (let page = 1; page <= 3; page++) {
        const response = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${perPage}&page=${page}`, {
            headers: {
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "DevDNA",
            },
        });
        if (response.status === 404) {
            throw new Error("Usuário do GitHub não encontrado.");
        }
        if (response.status === 403 || response.status === 429) {
            throw new Error("Limite de consultas do GitHub atingido.");
        }
        if (!response.ok) {
            throw new Error("Não foi possível buscar os repositórios.");
        }
        const data = (await response.json());
        repositories.push(...data.map((repo) => ({
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            size: repo.size,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
            isFork: repo.fork,
            isArchived: repo.archived,
            defaultBranch: repo.default_branch,
        })));
        if (data.length < perPage) {
            break;
        }
    }
    return repositories;
}
//# sourceMappingURL=github.repositories.js.map