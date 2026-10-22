
import { useState, type FormEvent } from "react";

import {
  Dna,
  Code2,
  Star,
  GitFork,
  Activity,
  Zap,
  FlaskConical,
  Trophy,
  AlertCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import "./App.css";
import { jsPDF } from "jspdf";


interface PerfilGitHub {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface ResultadoDNA {
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
    atividade: {
    ultimaPublicacao: string | null;
    diasDesdeUltimaPublicacao: number;
  };
  linguagens: {
    linguagem: string;
    porcentagem: number;
    quantidadeRepositorios: number;
  }[];
  pontuacao: {
    total: number;
    limite: number;
    indicadores: {
      equilibrio: number;
      diversidade: number;
      experimentacao: number;
      reconhecimento: number;
      atividade: number;
    };
  };
  caracteristicas: {
    arquetipo: string;
    descricaoArquetipo: string;
    quantidadeLinguagens: number;
    repositoriosExperimentais: number;
  };
}

interface PerfilRecebidoAPI {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
}

const CORES_GRAFICO = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];



function exportarRelatorioPDF(perfil: PerfilGitHub, dna: ResultadoDNA) {
  const pdf = new jsPDF();
  const margem = 20;
  const largura = 170;
  let y = 20;

  const adicionarTexto = (texto: string) => {
    const linhas = pdf.splitTextToSize(texto, largura);

    if (y + linhas.length * 7 > 275) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(linhas, margem, y);
    y += linhas.length * 7;
  };

  pdf.setFontSize(22);
  pdf.text("DevDNA", margem, y);
  y += 12;

  pdf.setFontSize(16);
  adicionarTexto("Relatorio de analise do GitHub");
  y += 3;

  pdf.setFontSize(11);
  adicionarTexto(`Perfil: @${perfil.login}`);
  adicionarTexto(`Nome: ${perfil.name || "Nao informado"}`);
  adicionarTexto(`Repositorios publicos: ${perfil.public_repos}`);
  adicionarTexto(`Seguidores: ${perfil.followers}`);
  adicionarTexto(`Seguindo: ${perfil.following}`);
  y += 5;

  pdf.setFontSize(14);
  adicionarTexto("Visao geral");
  pdf.setFontSize(11);
  adicionarTexto(
    `Repositorios analisados: ${dna.visaoGeral.repositoriosAnalisados}`,
  );
  adicionarTexto(
    `Projetos proprios: ${dna.visaoGeral.repositoriosOriginais}`,
  );
  adicionarTexto(
    `Repositorios bifurcados: ${dna.visaoGeral.repositoriosBifurcados}`,
  );
  adicionarTexto(
    `Repositorios ativos: ${dna.visaoGeral.repositoriosAtivos}`,
  );
  adicionarTexto(
    `Repositorios arquivados: ${dna.visaoGeral.repositoriosArquivados}`,
  );
  adicionarTexto(`Total de estrelas: ${dna.visaoGeral.totalEstrelas}`);
  adicionarTexto(`Total de forks: ${dna.visaoGeral.totalBifurcacoes}`);
  adicionarTexto(
    `Media de estrelas: ${dna.visaoGeral.mediaEstrelas.toFixed(2)}`,
  );
  y += 5;

  pdf.setFontSize(14);
  adicionarTexto("Linguagens utilizadas");
  pdf.setFontSize(11);

  dna.linguagens.forEach((linguagem) => {
    adicionarTexto(
      `${linguagem.linguagem}: ${linguagem.quantidadeRepositorios} repositorio(s) - ${linguagem.porcentagem}%`,
    );
  });

  y += 5;
  pdf.setFontSize(14);
  adicionarTexto("Arquetipo");
  pdf.setFontSize(11);
  adicionarTexto(dna.caracteristicas.arquetipo);
  adicionarTexto(dna.caracteristicas.descricaoArquetipo);
  y += 5;

  pdf.setFontSize(14);
  adicionarTexto("Pontuacao DevDNA");
  pdf.setFontSize(11);
  adicionarTexto(
    `Pontuacao total: ${dna.pontuacao.total}/${dna.pontuacao.limite}`,
  );

  adicionarTexto(
    `Diversidade: ${dna.pontuacao.indicadores.diversidade}/25`,
  );
  adicionarTexto(
    `Equilibrio: ${dna.pontuacao.indicadores.equilibrio}/25`,
  );
  adicionarTexto(
    `Experimentacao: ${dna.pontuacao.indicadores.experimentacao}/25`,
  );
  adicionarTexto(
    `Reconhecimento: ${dna.pontuacao.indicadores.reconhecimento}/25`,
  );
  adicionarTexto(
    `Atividade: ${dna.pontuacao.indicadores.atividade}/25`,
  );

  y += 8;
  pdf.setFontSize(9);
  adicionarTexto(
    `Ultima publicacao: ${
      dna.atividade.ultimaPublicacao
        ? new Date(dna.atividade.ultimaPublicacao).toLocaleDateString("pt-BR")
        : "Sem dados"
    }`,
  );
  adicionarTexto(
    `Relatorio gerado em ${new Date().toLocaleDateString("pt-BR")}`,
  );

  pdf.save(`DevDNA-${perfil.login}.pdf`);
}

function App() {
  const [usuario, setUsuario] = useState("");
  const [perfil, setPerfil] = useState<PerfilGitHub | null>(null);
  const [dna, setDna] = useState<ResultadoDNA | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function analisarPerfil(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const nomeUsuario = usuario.trim();

    if (!nomeUsuario) {
      setErro("Digite seu nome de usuário do GitHub.");
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

    if (!apiUrl) {
      setErro(
        "A URL da API não foi configurada. Verifique o arquivo .env do frontend.",
      );
      return;
    }

    setCarregando(true);
    setErro("");
    setPerfil(null);
    setDna(null);

    try {
      const [respostaPerfil, respostaDNA] = await Promise.all([
        fetch(
          `${apiUrl}/github/${encodeURIComponent(nomeUsuario)}`,
        ),
        fetch(
          `${apiUrl}/github/${encodeURIComponent(nomeUsuario)}/dna`,
        ),
      ]);

      if (!respostaPerfil.ok || !respostaDNA.ok) {
        if (
          respostaPerfil.status === 404 ||
          respostaDNA.status === 404
        ) {
          throw new Error(
            "Usuário não encontrado. Confira o nome e tente novamente.",
          );
        }

        throw new Error(
          "Não foi possível analisar esse perfil. Verifique se o backend está funcionando.",
        );
      }

      const perfilRecebido =
        (await respostaPerfil.json()) as PerfilRecebidoAPI;

      const dadosPerfil: PerfilGitHub = {
        login: perfilRecebido.username,
        name: perfilRecebido.name,
        avatar_url: perfilRecebido.avatarUrl,
        html_url: perfilRecebido.profileUrl,
        bio: perfilRecebido.bio,
        public_repos: Number(perfilRecebido.publicRepos ?? 0),
        followers: Number(perfilRecebido.followers ?? 0),
        following: Number(perfilRecebido.following ?? 0),
      };

      const dadosDNA = await respostaDNA.json();

      if (!dadosDNA.dna) {
        throw new Error(
          "A API respondeu, mas não retornou os dados do DNA.",
        );
      }

      setPerfil(dadosPerfil);
      setDna(dadosDNA.dna as ResultadoDNA);
    } catch (erroRecebido) {
      setErro(
        erroRecebido instanceof Error
          ? erroRecebido.message
          : "Ocorreu um erro inesperado.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function formatarNumero(numero: number) {
    return new Intl.NumberFormat("pt-BR", {
      notation: numero >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(numero);
  }

  function formatarUltimaPublicacao(data: string | null) {
    if (!data) return "Sem dados";

    return new Date(data).toLocaleDateString("pt-BR");
  }

    function gerarRecomendacoes(dna: ResultadoDNA) {
    const recomendacoes: string[] = [];

    if (dna.caracteristicas.quantidadeLinguagens < 3) {
      recomendacoes.push(
        "Explore uma nova linguagem para ampliar seu repertório tecnológico.",
      );
    }

    if (dna.visaoGeral.repositoriosOriginais < 3) {
      recomendacoes.push(
        "Desenvolva mais projetos próprios para demonstrar suas habilidades e ideias.",
      );
    }

    if (dna.visaoGeral.totalEstrelas === 0) {
      recomendacoes.push(
        "Invista em documentação e divulgação dos projetos para facilitar que outras pessoas os encontrem.",
      );
    }

    if (
      dna.atividade.ultimaPublicacao === null ||
      dna.atividade.diasDesdeUltimaPublicacao > 90
    ) {
      recomendacoes.push(
        "Atualize seus projetos ou publique um novo projeto para manter seu portfólio ativo.",
      );
    }

    if (recomendacoes.length === 0) {
      recomendacoes.push(
        "Continue desenvolvendo projetos próprios, documentando suas decisões técnicas e explorando novas soluções.",
      );
    }

    return recomendacoes;
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <a className="marca" href="#">
          <span className="marca-icone">
            <Dna size={25} />
          </span>
          <span>
            Dev<span className="texto-destaque">DNA</span>
          </span>
        </a>

        <a
          className="link-github"
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
        >
          <Code2 size={20} />
          GitHub
        </a>
      </header>

      <section className="hero">
        <div className="etiqueta">
          <span className="ponto-pulsante" />
          INTELIGÊNCIA PARA DESENVOLVEDORES
        </div>

        <h1>
          Descubra o seu
          <br />
          <span className="texto-gradiente">
            DNA de desenvolvedor.
          </span>
        </h1>

        <p className="descricao-hero">
          Analise seus projetos, descubra suas linguagens dominantes
          e encontre seu arquétipo no universo da programação.
        </p>

        <form
          className="formulario-busca"
          onSubmit={analisarPerfil}
        >
          <Code2 size={22} className="icone-busca" />

          <input
            type="text"
            value={usuario}
            onChange={(evento) => setUsuario(evento.target.value)}
            placeholder="Seu nome de usuário do GitHub"
            aria-label="Nome de usuário do GitHub"
          />

          <button type="submit" disabled={carregando}>
            <span className="icone-botao">
  {carregando ? "⏳" : "⌕"}
</span>
<span>
  {carregando ? "Analisando..." : "Analisar DNA"}
</span>
          </button>
        </form>

        <p className="nota-busca">
          <Activity size={14} />
          Análise baseada em repositórios públicos do GitHub
        </p>

        {erro && (
          <div className="mensagem-erro">
            <AlertCircle size={19} />
            {erro}
          </div>
        )}
      </section>

      {perfil && dna ? (
        <section className="resultados">
          <div className="perfil-cartao">
            <img
              className="avatar"
              src={perfil.avatar_url}
              alt={`Avatar de ${perfil.login}`}
            />

            <div className="perfil-informacoes">
              <span className="perfil-etiqueta">
                PERFIL ANALISADO
              </span>

              <h2>{perfil.name || perfil.login}</h2>

              <a
                href={perfil.html_url}
                target="_blank"
                rel="noreferrer"
              >
                @{perfil.login} <Code2 size={14} />
              </a>

              {perfil.bio && <p>{perfil.bio}</p>}
            </div>

            <div className="pontuacao-principal">
              <span>PONTUAÇÃO DNA</span>
              <strong>{dna.pontuacao.total}</strong>
              <small>de {dna.pontuacao.limite} pontos</small>
            </div>
            <button
  type="button"
  className="botao-exportar"
  onClick={() => exportarRelatorioPDF(perfil, dna)}
>
  Baixar relatório PDF
</button>
          </div>

          <div className="grade-estatisticas">
            <div className="cartao-estatistica">
              <Code2 />
              <span>Repositórios analisados</span>
              <strong>
                {formatarNumero(dna.visaoGeral.repositoriosAnalisados)}
              </strong>
            </div>

            <div className="cartao-estatistica">
              <Star />
              <span>Estrelas recebidas</span>
              <strong>
                {formatarNumero(dna.visaoGeral.totalEstrelas)}
              </strong>
            </div>

            <div className="cartao-estatistica">
              <GitFork />
              <span>Forks recebidos</span>
              <strong>
                {formatarNumero(dna.visaoGeral.totalBifurcacoes)}
              </strong>
            </div>

            <div className="cartao-estatistica">
              <Activity />
              <span>Repositórios ativos</span>
              <strong>
                {formatarNumero(dna.visaoGeral.repositoriosAtivos)}
              </strong>
            </div>

            <div className="cartao-estatistica">
              <Trophy />
              <span>Seguidores</span>
              <strong>{formatarNumero(perfil.followers)}</strong>
            </div>

            <div className="cartao-estatistica">
              <Code2 />
              <span>Repositórios públicos</span>
              <strong>{formatarNumero(perfil.public_repos)}</strong>
            </div>

            <div className="cartao-estatistica">
              <Activity />
              <span>Seguindo</span>
              <strong>{formatarNumero(perfil.following)}</strong>
            </div>
          </div>

<div className="grade-estatisticas">
  <div className="cartao-estatistica">
    <Code2 />
    <span>Projetos próprios</span>
    <strong>
      {formatarNumero(dna.visaoGeral.repositoriosOriginais)}
    </strong>
  </div>

  <div className="cartao-estatistica">
    <GitFork />
    <span>Repositórios bifurcados</span>
    <strong>
      {formatarNumero(dna.visaoGeral.repositoriosBifurcados)}
    </strong>
  </div>

  <div className="cartao-estatistica">
    <Activity />
    <span>Repositórios arquivados</span>
    <strong>
      {formatarNumero(dna.visaoGeral.repositoriosArquivados)}
    </strong>
  </div>

  <div className="cartao-estatistica">
    <Star />
    <span>Média de estrelas</span>
    <strong>
      {formatarNumero(dna.visaoGeral.mediaEstrelas)}
    </strong>
  </div>

  <div className="cartao-estatistica">
    <Activity />
    <span>Última publicação</span>
    <strong>
      {formatarUltimaPublicacao(dna.atividade.ultimaPublicacao)}
    </strong>
    <small>
      {dna.atividade.ultimaPublicacao === null
        ? "Nenhuma data disponível"
        : dna.atividade.diasDesdeUltimaPublicacao === 0
          ? "Publicou hoje"
          : `Há ${dna.atividade.diasDesdeUltimaPublicacao} dias`}
    </small>
  </div>
</div>

          <div className="grade-paineis">
            <article className="painel">
              <div className="titulo-painel">
                <span className="icone-painel roxo">
                  <Dna size={20} />
                </span>

                <div>
                  <h3>Seu arquétipo</h3>
                  <p>Identidade técnica</p>
                </div>
              </div>

              <div className="arquetipo">
                <span className="arquetipo-icone">
                  <Zap size={27} />
                </span>

                <h2>{dna.caracteristicas.arquetipo}</h2>

                <p>{dna.caracteristicas.descricaoArquetipo}</p>
              </div>

              <div className="linha-informacao">
                <span>Linguagens identificadas</span>
                <strong>
                  {dna.caracteristicas.quantidadeLinguagens}
                </strong>
              </div>

              <div className="linha-informacao">
                <span>Projetos experimentais</span>
                <strong>
                  {dna.caracteristicas.repositoriosExperimentais}
                </strong>
              </div>
            </article>

            <article className="painel">
              <div className="titulo-painel">
                <span className="icone-painel azul">
                  <Code2 size={20} />
                </span>

                <div>
                  <h3>Linguagens</h3>
                  <p>Distribuição dos seus projetos próprios</p>
                </div>
              </div>

              {dna.linguagens.length > 0 ? (
                <>
                  <div className="grafico-linguagens">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={dna.linguagens.slice(0, 6)}
                          dataKey="porcentagem"
                          nameKey="linguagem"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={55}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {dna.linguagens
                            .slice(0, 6)
                            .map((linguagem, index) => (
                              <Cell
                                key={linguagem.linguagem}
                                fill={
                                  CORES_GRAFICO[
                                    index % CORES_GRAFICO.length
                                  ]
                                }
                              />
                            ))}
                        </Pie>

                        <Tooltip
                          formatter={(valor) => [
                            `${valor}%`,
                            "Participação",
                          ]}
                          contentStyle={{
                            backgroundColor: "#18181b",
                            border: "1px solid #3f3f46",
                            borderRadius: "8px",
                            color: "#ffffff",
                          }}
                        />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="lista-linguagens">
                    {dna.linguagens
                      .slice(0, 6)
                      .map((linguagem) => (
                        <div
                          className="item-linguagem"
                          key={linguagem.linguagem}
                        >
                          <div className="linguagem-cabecalho">
                            <span>{linguagem.linguagem}</span>
                            <strong>{linguagem.porcentagem}%</strong>
                          </div>

                          <div className="barra-fundo">
                            <div
                              className="barra-preenchida"
                              style={{
                                width: `${linguagem.porcentagem}%`,
                              }}
                            />
                          </div>

                          <small>
                            {linguagem.quantidadeRepositorios}{" "}
                            {linguagem.quantidadeRepositorios === 1
                              ? "repositório"
                              : "repositórios"}
                          </small>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <p className="texto-vazio">
                  Nenhuma linguagem identificada nos projetos próprios.
                </p>
              )}
            </article>
          </div>

          <article className="painel painel-pontuacao">
            <div className="titulo-painel">
              <span className="icone-painel verde">
                <Trophy size={20} />
              </span>

              <div>
                <h3>Composição da pontuação</h3>
                <p>Como o DevDNA calculou seu resultado</p>
              </div>
            </div>

            {(
              [
                [
  "Diversidade",
  dna.pontuacao.indicadores.diversidade,
],
[
  "Equilíbrio tecnológico",
  dna.pontuacao.indicadores.equilibrio,
],
[
  "Experimentação",
  dna.pontuacao.indicadores.experimentacao,
],
[
  "Reconhecimento",
  dna.pontuacao.indicadores.reconhecimento,
],
[
  "Atividade",
  dna.pontuacao.indicadores.atividade,
],
              ] as const
            ).map(([nome, valor]) => (
              <div className="item-pontuacao" key={nome}>
                <div className="linguagem-cabecalho">
                  <span>{nome}</span>
                  <strong>{valor}/25</strong>
                </div>

                <div className="barra-fundo">
                  <div
                    className="barra-preenchida barra-pontuacao"
                    style={{
                      width: `${(valor / 25) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <p className="aviso-pontuacao">
              <FlaskConical size={16} />
              Esta pontuação é experimental e considera apenas
              indicadores simples dos repositórios públicos. Não mede
              a habilidade real de uma pessoa desenvolvedora.
            </p>
          </article>
          
                    <article className="painel painel-recomendacoes">
            <div className="titulo-painel">
              <span className="icone-painel verde">
                <Zap size={20} />
              </span>

              <div>
                <h3>Seu próximo nível</h3>
                <p>Recomendações para evoluir como desenvolvedor</p>
              </div>
            </div>

            <ul className="lista-recomendacoes">
              {gerarRecomendacoes(dna).map((recomendacao, index) => (
                <li key={index}>
                  <span className="recomendacao-numero">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span>{recomendacao}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      ) : (
        <section className="secao-recursos">
          <div className="recurso">
            <span className="recurso-icone roxo">
              <Dna size={23} />
            </span>
            <h3>Seu arquétipo</h3>
            <p>
              Descubra qual perfil técnico mais combina com seus projetos.
            </p>
          </div>

          <div className="recurso">
            <span className="recurso-icone azul">
              <Code2 size={23} />
            </span>
            <h3>DNA tecnológico</h3>
            <p>
              Veja a distribuição das linguagens presentes nos seus projetos.
            </p>
          </div>

          <div className="recurso">
            <span className="recurso-icone verde">
              <FlaskConical size={23} />
            </span>
            <h3>Perfil experimental</h3>
            <p>
              Explore sua atividade, seus projetos e o reconhecimento recebido.
            </p>
          </div>
        </section>
      )}

      <footer className="rodape">
        <a className="marca marca-rodape" href="#">
          <Dna size={19} />
          Dev<span className="texto-destaque">DNA</span>
        </a>

        <span>Feito para explorar o universo do código.</span>
      </footer>
    </main>
  );
}

export default App;
