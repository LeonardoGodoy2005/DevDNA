import type { GithubRepository } from "../github/github.repositories.js"

export function analisarDesenvolvedor(
  repositorios: GithubRepository[],
) {
  const repositoriosOriginais = repositorios.filter(
    (repositorio) => !repositorio.isFork,
  )

  const linguagens: Record<string, number> = {}

  for (const repositorio of repositoriosOriginais) {
    if (!repositorio.language) continue

    linguagens[repositorio.language] =
      (linguagens[repositorio.language] ?? 0) + 1
  }

  const totalRepositoriosComLinguagem = Object.values(
    linguagens,
  ).reduce((total, quantidade) => total + quantidade, 0)

  const estatisticasLinguagens = Object.entries(linguagens)
    .map(([linguagem, quantidade]) => ({
      linguagem,
      quantidadeRepositorios: quantidade,
      porcentagem:
        totalRepositoriosComLinguagem > 0
          ? Number(
              (
                (quantidade / totalRepositoriosComLinguagem) *
                100
              ).toFixed(1),
            )
          : 0,
    }))
    .sort(
      (a, b) =>
        b.quantidadeRepositorios - a.quantidadeRepositorios,
    )

  const totalEstrelas = repositorios.reduce(
    (total, repositorio) => total + repositorio.stars,
    0,
  )

  const totalBifurcacoes = repositorios.reduce(
    (total, repositorio) => total + repositorio.forks,
    0,
  )

  const repositoriosArquivados = repositorios.filter(
    (repositorio) => repositorio.isArchived,
  ).length

  const repositoriosAtivos =
    repositorios.length - repositoriosArquivados

  const repositoriosExperimentais = repositoriosOriginais.filter(
    (repositorio) =>
      repositorio.stars < 10 && !repositorio.isArchived,
  ).length

  const ultimaPublicacao = repositorios
    .filter((repositorio) => repositorio.pushedAt !== null)
    .map((repositorio) =>
      new Date(repositorio.pushedAt as string).getTime(),
    )
    .filter((data) => Number.isFinite(data))
    .sort((a, b) => b - a)[0]

  const diasDesdeUltimaPublicacao =
    ultimaPublicacao === undefined
      ? null
      : Math.max(
          0,
          Math.floor(
            (Date.now() - ultimaPublicacao) /
              (1000 * 60 * 60 * 24),
          ),
        )

  const quantidadeLinguagens = estatisticasLinguagens.length

  const pontuacaoDiversidade = Math.min(
    quantidadeLinguagens * 5,
    25,
  )

  const pontuacaoExperimentacao = Math.min(
    repositoriosExperimentais * 5,
    25,
  )

  const pontuacaoReconhecimento = Math.min(
    Math.round(Math.log10(totalEstrelas + 1) * 8),
    25,
  )

  const pontuacaoAtividade =
    diasDesdeUltimaPublicacao === null
      ? 0
      : diasDesdeUltimaPublicacao <= 7
        ? 25
        : diasDesdeUltimaPublicacao <= 30
          ? 20
          : diasDesdeUltimaPublicacao <= 90
            ? 15
            : diasDesdeUltimaPublicacao <= 180
              ? 10
              : diasDesdeUltimaPublicacao <= 365
                ? 5
                : 0

  const pontuacaoTotal =
    pontuacaoDiversidade +
    pontuacaoExperimentacao +
    pontuacaoReconhecimento +
    pontuacaoAtividade

  const quantidadeRepositoriosOriginais =
    repositoriosOriginais.length

  const mediaEstrelas =
    repositorios.length > 0
      ? totalEstrelas / repositorios.length
      : 0

  let arquetipo = "O Explorador"

  let descricaoArquetipo =
    "Explora diferentes possibilidades e está construindo sua identidade técnica."

  if (
    quantidadeLinguagens >= 5 &&
    quantidadeRepositoriosOriginais >= 5
  ) {
    arquetipo = "O Poliglota"
    descricaoArquetipo =
      "Possui projetos em várias linguagens e demonstra diversidade tecnológica."
  } else if (
    quantidadeLinguagens === 1 &&
    quantidadeRepositoriosOriginais >= 5
  ) {
    arquetipo = "O Especialista"
    descricaoArquetipo =
      "Concentra seus projetos em uma única linguagem identificada pelo GitHub."
  } else if (
    quantidadeRepositoriosOriginais >= 5 &&
    mediaEstrelas >= 20
  ) {
    arquetipo = "O Arquiteto"
    descricaoArquetipo =
      "Seus projetos apresentam reconhecimento da comunidade."
  } else if (
    repositoriosExperimentais >= 5 &&
    quantidadeRepositoriosOriginais >= 5
  ) {
    arquetipo = "O Experimentador"
    descricaoArquetipo =
      "Mantém vários projetos próprios com pouca popularidade aparente."
  } else if (
    quantidadeRepositoriosOriginais >= 5 &&
    repositoriosArquivados === 0
  ) {
    arquetipo = "O Construtor"
    descricaoArquetipo =
      "Possui vários projetos próprios e nenhum repositório arquivado no conjunto analisado."
  }

  return {
    visaoGeral: {
      repositoriosAnalisados: repositorios.length,
      repositoriosOriginais: quantidadeRepositoriosOriginais,
      repositoriosBifurcados:
        repositorios.length - quantidadeRepositoriosOriginais,
      repositoriosAtivos,
      repositoriosArquivados,
      totalEstrelas,
      totalBifurcacoes,
      mediaEstrelas: Number(mediaEstrelas.toFixed(1)),
    },

    linguagens: estatisticasLinguagens,

    atividade: {
      ultimaPublicacao:
        ultimaPublicacao === undefined
          ? null
          : new Date(ultimaPublicacao).toISOString(),
      diasDesdeUltimaPublicacao,
    },

    pontuacao: {
      total: pontuacaoTotal,
      limite: 100,
      indicadores: {
        diversidade: pontuacaoDiversidade,
        experimentacao: pontuacaoExperimentacao,
        reconhecimento: pontuacaoReconhecimento,
        atividade: pontuacaoAtividade,
      },
    },

    caracteristicas: {
      arquetipo,
      descricaoArquetipo,
      repositoriosExperimentais,
      quantidadeLinguagens,
    }
}
}