import type { GithubRepository } from "../github/github.repositories.js";
export declare function analisarDesenvolvedor(repositorios: GithubRepository[]): {
    visaoGeral: {
        repositoriosAnalisados: number;
        repositoriosOriginais: number;
        repositoriosBifurcados: number;
        repositoriosAtivos: number;
        repositoriosArquivados: number;
        totalEstrelas: number;
        totalBifurcacoes: number;
        mediaEstrelas: number;
    };
    linguagens: {
        linguagem: string;
        quantidadeRepositorios: number;
        porcentagem: number;
    }[];
    atividade: {
        ultimaPublicacao: string | null;
        diasDesdeUltimaPublicacao: number | null;
    };
    pontuacao: {
        total: number;
        limite: number;
        indicadores: {
            diversidade: number;
            equilibrio: number;
            experimentacao: number;
            reconhecimento: number;
            atividade: number;
        };
    };
    caracteristicas: {
        arquetipo: string;
        descricaoArquetipo: string;
        repositoriosExperimentais: number;
        quantidadeLinguagens: number;
    };
};
//# sourceMappingURL=dna.analyzer.d.ts.map