
const GITHUB_API = "https://api.github.com"

export interface GithubRepository {
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  size: number
  createdAt: string
  updatedAt: string
  pushedAt: string | null
  isFork: boolean
  isArchived: boolean
  defaultBranch: string
}

export async function getGithubRepositories(
  username: string,
): Promise<GithubRepository[]> {
  const repositories: GithubRepository[] = []
  const perPage = 100

  for (let page = 1; page <= 3; page++) {
    const response = await fetch(
      `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "DevDNA",
        },
      },
    )

    if (response.status === 404) {
      throw new Error("Usuário do GitHub não encontrado.")
    }

    if (response.status === 403 || response.status === 429) {
      throw new Error("Limite de consultas do GitHub atingido.")
    }

    if (!response.ok) {
      throw new Error("Não foi possível buscar os repositórios.")
    }

    const data = (await response.json()) as Array<{
      name: string
      description: string | null
      html_url: string
      language: string | null
      stargazers_count: number
      forks_count: number
      size: number
      created_at: string
      updated_at: string
      pushed_at: string | null
      fork: boolean
      archived: boolean
      default_branch: string
    }>

    repositories.push(
      ...data.map((repo) => ({
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
      })),
    )

    if (data.length < perPage) {
      break
    }
  }

  return repositories
}
