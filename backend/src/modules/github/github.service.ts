
const GITHUB_API = "https://api.github.com"

export async function getGithubUser(username: string) {
  const response = await fetch(
    `${GITHUB_API}/users/${encodeURIComponent(username)}`,
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
    throw new Error("Limite de consultas do GitHub atingido. Tente novamente mais tarde.")
  }

  if (!response.ok) {
    throw new Error("Não foi possível consultar o GitHub.")
  }

  const user = await response.json()

  return {
    username: user.login,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    createdAt: user.created_at,
  }
}
