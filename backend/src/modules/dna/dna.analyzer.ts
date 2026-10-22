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
    const distribuicaoLinguagens =
    totalRepositoriosComLinguagem > 0
      ? estatisticasLinguagens.reduce((total, item) => {
          const proporcao =
            item.quantidadeRepositorios /
            totalRepositoriosComLinguagem

          return total + proporcao ** 2
        }, 0)
      : 0

  
  const pontuacaoEquilibrio = Math.round(
    (1 - distribuicaoLinguagens) * 20,
  )

  const pontuacaoDiversidade = Math.min(
    Math.round(
      quantidadeLinguagens === 0
        ? 0
        : (quantidadeLinguagens / 5) * 20,
    ),
    20,
  )

  const pontuacaoExperimentacao = Math.min(
    repositoriosExperimentais * 4,
    20,
  )

  const pontuacaoReconhecimento = Math.min(
    Math.round(
      repositorios.reduce(
        (total, repositorio) =>
          total + Math.log10(repositorio.stars + 1),
        0,
      ) * 4,
    ),
    20,
  )

  const pontuacaoAtividade =
    diasDesdeUltimaPublicacao === null
      ? 0
      : diasDesdeUltimaPublicacao <= 7
        ? 20
        : diasDesdeUltimaPublicacao <= 30
          ? 16
          : diasDesdeUltimaPublicacao <= 90
            ? 12
            : diasDesdeUltimaPublicacao <= 180
              ? 8
              : diasDesdeUltimaPublicacao <= 365
                ? 4
                : 0

  const pontuacaoTotal =
    pontuacaoDiversidade +
    pontuacaoEquilibrio +
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
    quantidadeRepositoriosOriginais >= 5 &&
    quantidadeLinguagens >= 5
  ) {
    arquetipo = "O Poliglota"
    descricaoArquetipo =
      "Explora várias linguagens de programação e demonstra diversidade tecnológica."
  } else if (
    quantidadeRepositoriosOriginais >= 5 &&
    mediaEstrelas >= 20
  ) {
    arquetipo = "O Arquiteto"
    descricaoArquetipo =
      "Seus projetos apresentam reconhecimento da comunidade e demonstram potencial de impacto."
  } else if (
    quantidadeRepositoriosOriginais >= 5 &&
    quantidadeLinguagens === 1
  ) {
    arquetipo = "O Especialista"
    descricaoArquetipo =
      "Concentra seus projetos em uma linguagem e demonstra foco em uma área técnica."
  } else if (
    quantidadeRepositoriosOriginais >= 5 &&
    repositoriosExperimentais >= 5
  ) {
    arquetipo = "O Experimentador"
    descricaoArquetipo =
      "Mantém vários projetos próprios experimentais, explorando ideias e possibilidades."
  } else if (
    quantidadeRepositoriosOriginais >= 5 &&
    repositoriosArquivados === 0
  ) {
    arquetipo = "O Construtor"
    descricaoArquetipo =
      "Mantém vários projetos próprios sem repositórios arquivados no conjunto analisado."
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
        equilibrio: pontuacaoEquilibrio,
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