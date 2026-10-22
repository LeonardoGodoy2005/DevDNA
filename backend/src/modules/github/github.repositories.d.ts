export interface GithubRepository {
    name: string;
    description: string | null;
    url: string;
    language: string | null;
    stars: number;
    forks: number;
    size: number;
    createdAt: string;
    updatedAt: string;
    pushedAt: string | null;
    isFork: boolean;
    isArchived: boolean;
    defaultBranch: string;
}
export declare function getGithubRepositories(username: string): Promise<GithubRepository[]>;
//# sourceMappingURL=github.repositories.d.ts.map