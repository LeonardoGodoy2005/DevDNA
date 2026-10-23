
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
import HeliceDNA3D from "./HeliceDNA3D";
import FundoImersivo from "./FundoImersivo";

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
  "#48a9ff",
  "#43e0e8",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
];

function exportarRelatorioPDF(
  perfil: PerfilGitHub,
  dna: ResultadoDNA,
) {
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
        ? new Date(
            dna.atividade.ultimaPublicacao,
          ).toLocaleDateString("pt-BR")
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

  async function analisarPerfil(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    const nomeUsuario = usuario.trim();

    if (!nomeUsuario) {
      setErro("Digite seu nome de usuário do GitHub.");
      return;
    }

    const apiUrl = (
  import.meta.env.VITE_API_URL ||
  "https://devdna-api-ul1h.onrender.com"
).replace(/\/+$/, "");
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

  function gerarRecomendacoes(dadosDNA: ResultadoDNA) {
    const recomendacoes: string[] = [];

    if (dadosDNA.caracteristicas.quantidadeLinguagens < 3) {
      recomendacoes.push(
        "Explore uma nova linguagem para ampliar seu repertório tecnológico.",
      );
    }

    if (dadosDNA.visaoGeral.repositoriosOriginais < 3) {
      recomendacoes.push(
        "Desenvolva mais projetos próprios para demonstrar suas habilidades e ideias.",
      );
    }

    if (dadosDNA.visaoGeral.totalEstrelas === 0) {
      recomendacoes.push(
        "Invista em documentação e divulgação dos projetos para facilitar que outras pessoas os encontrem.",
      );
    }

    if (
      dadosDNA.atividade.ultimaPublicacao === null ||
      dadosDNA.atividade.diasDesdeUltimaPublicacao > 90
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
    <>
      <FundoImersivo />
      <HeliceDNA3D />

      <main className="pagina">
        <header className="cabecalho">
          <a className="marca" href="#inicio">
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

        <nav
          className="navegacao-dashboard"
          aria-label="Navegação principal"
        >
          <a className="item-navegacao ativo" href="#inicio">
            <Dna size={17} />
            <span>Visão geral</span>
          </a>

          <a className="item-navegacao" href="#resultados">
            <Activity size={17} />
            <span>Análises</span>
          </a>

          <a className="item-navegacao" href="#recursos">
            <Code2 size={17} />
            <span>Recursos</span>
          </a>
        </nav>

        <section className="hero" id="inicio">
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
            <div className="mensagem-erro" role="alert">
              <AlertCircle size={19} />
              {erro}
            </div>
          )}
        </section>

        {perfil && dna ? (
   
<section className="resultados resultados-dashboard" id="resultados">
  {/* Cabeçalho do perfil */}
  <header className="dashboard-perfil">
    <div className="dashboard-perfil-identidade">
      <div className="dashboard-avatar-container">
        <img
          className="avatar"
          src={perfil.avatar_url}
          alt={`Avatar de ${perfil.login}`}
        />
        <span className="dashboard-status" title="Perfil analisado" />
      </div>

      <div className="perfil-informacoes">
        <span className="perfil-etiqueta">
          <Dna size={14} />
          ANÁLISE DE DNA DIGITAL
        </span>

        <h2>{perfil.name || perfil.login}</h2>

        <a
          href={perfil.html_url}
          target="_blank"
          rel="noreferrer"
        >
          @{perfil.login}
          <Code2 size={14} />
        </a>

        {perfil.bio && (
          <p className="dashboard-biografia">{perfil.bio}</p>
        )}

        <div className="dashboard-tags">
          <span>
            <Code2 size={13} />
            {formatarNumero(perfil.public_repos)} repositórios públicos
          </span>
          <span>
            <Trophy size={13} />
            {formatarNumero(perfil.followers)} seguidores
          </span>
        </div>
      </div>
    </div>

    <div className="dashboard-pontuacao">
      <div className="dashboard-pontuacao-topo">
        <span>PONTUAÇÃO DNA</span>
        <Trophy size={19} />
      </div>

      <div className="dashboard-pontuacao-valor">
        <strong>{dna.pontuacao.total}</strong>
        <span>/{dna.pontuacao.limite}</span>
      </div>

      <div className="dashboard-pontuacao-trilho">
        <div
          className="dashboard-pontuacao-progresso"
          style={{
            width: `${
              dna.pontuacao.limite > 0
                ? Math.min(
                    100,
                    Math.max(
                      0,
                      (dna.pontuacao.total / dna.pontuacao.limite) * 100,
                    ),
                  )
                : 0
            }%`,
          }}
        />
      </div>

      <small>Índice experimental do perfil</small>

      <button
        type="button"
        className="botao-exportar"
        onClick={() => exportarRelatorioPDF(perfil, dna)}
      >
        <span>Baixar relatório PDF</span>
      </button>
    </div>
  </header>

  {/* Indicadores principais */}
  <section className="dashboard-secao">
    <div className="dashboard-secao-cabecalho">
      <div>
        <span className="dashboard-sobretitulo">VISÃO GERAL</span>
        <h3>Indicadores do perfil</h3>
      </div>
      <span className="dashboard-contagem">
        01 / MÉTRICAS
      </span>
    </div>

    <div className="dashboard-metricas">
      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone roxo">
          <Code2 size={19} />
        </span>
        <span className="dashboard-metrica-label">
          Repositórios analisados
        </span>
        <strong>
          {formatarNumero(dna.visaoGeral.repositoriosAnalisados)}
        </strong>
        <small>Base da análise</small>
      </article>

      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone amarelo">
          <Star size={19} />
        </span>
        <span className="dashboard-metrica-label">
          Estrelas recebidas
        </span>
        <strong>
          {formatarNumero(dna.visaoGeral.totalEstrelas)}
        </strong>
        <small>Reconhecimento público</small>
      </article>

      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone azul">
          <GitFork size={19} />
        </span>
        <span className="dashboard-metrica-label">
          Forks recebidos
        </span>
        <strong>
          {formatarNumero(dna.visaoGeral.totalBifurcacoes)}
        </strong>
        <small>Derivações dos projetos</small>
      </article>

      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone verde">
          <Activity size={19} />
        </span>
        <span className="dashboard-metrica-label">
          Repositórios ativos
        </span>
        <strong>
          {formatarNumero(dna.visaoGeral.repositoriosAtivos)}
        </strong>
        <small>Atividade identificada</small>
      </article>

      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone rosa">
          <Trophy size={19} />
        </span>
        <span className="dashboard-metrica-label">Seguidores</span>
        <strong>{formatarNumero(perfil.followers)}</strong>
        <small>Alcance do perfil</small>
      </article>

      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone azul">
          <Activity size={19} />
        </span>
        <span className="dashboard-metrica-label">Seguindo</span>
        <strong>{formatarNumero(perfil.following)}</strong>
        <small>Perfis acompanhados</small>
      </article>

      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone roxo">
          <Code2 size={19} />
        </span>
        <span className="dashboard-metrica-label">
          Projetos próprios
        </span>
        <strong>
          {formatarNumero(dna.visaoGeral.repositoriosOriginais)}
        </strong>
        <small>Repositórios originais</small>
      </article>

      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone azul">
          <GitFork size={19} />
        </span>
        <span className="dashboard-metrica-label">
          Repositórios bifurcados
        </span>
        <strong>
          {formatarNumero(dna.visaoGeral.repositoriosBifurcados)}
        </strong>
        <small>Projetos derivados</small>
      </article>

      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone neutro">
          <Activity size={19} />
        </span>
        <span className="dashboard-metrica-label">
          Repositórios arquivados
        </span>
        <strong>
          {formatarNumero(dna.visaoGeral.repositoriosArquivados)}
        </strong>
        <small>Projetos arquivados</small>
      </article>

      <article className="dashboard-metrica">
        <span className="dashboard-metrica-icone amarelo">
          <Star size={19} />
        </span>
        <span className="dashboard-metrica-label">
          Média de estrelas
        </span>
        <strong>
          {formatarNumero(dna.visaoGeral.mediaEstrelas)}
        </strong>
        <small>Por repositório</small>
      </article>

      <article className="dashboard-metrica dashboard-metrica-data">
        <span className="dashboard-metrica-icone verde">
          <Activity size={19} />
        </span>
        <span className="dashboard-metrica-label">
          Última publicação
        </span>
        <strong className="valor-data">
          {formatarUltimaPublicacao(dna.atividade.ultimaPublicacao)}
        </strong>
        <small>
          {dna.atividade.ultimaPublicacao === null
            ? "Nenhuma data disponível"
            : dna.atividade.diasDesdeUltimaPublicacao === 0
              ? "Publicou hoje"
              : `Há ${dna.atividade.diasDesdeUltimaPublicacao} dias`}
        </small>
      </article>
    </div>
  </section>

  {/* Análise técnica */}
  <section className="dashboard-secao">
    <div className="dashboard-secao-cabecalho">
      <div>
        <span className="dashboard-sobretitulo">ANÁLISE TÉCNICA</span>
        <h3>Identidade e tecnologias</h3>
      </div>
      <span className="dashboard-contagem">02 / DNA</span>
    </div>

    <div className="dashboard-analises">
      <article className="painel dashboard-painel-arquetipo">
        <div className="titulo-painel">
          <span className="icone-painel roxo">
            <Dna size={20} />
          </span>
          <div>
            <h3>Seu arquétipo</h3>
            <p>Identidade técnica identificada</p>
          </div>
        </div>

        <div className="dashboard-arquetipo-conteudo">
          <span className="arquetipo-icone">
            <Zap size={27} />
          </span>
          <span className="dashboard-sobretitulo">
            PERFIL DE DESENVOLVIMENTO
          </span>
          <h2>{dna.caracteristicas.arquetipo}</h2>
          <p>{dna.caracteristicas.descricaoArquetipo}</p>
        </div>

        <div className="dashboard-detalhes-arquetipo">
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
        </div>
      </article>

      <article className="painel dashboard-painel-linguagens">
        <div className="titulo-painel">
          <span className="icone-painel azul">
            <Code2 size={20} />
          </span>
          <div>
            <h3>Linguagens</h3>
            <p>Distribuição nos projetos próprios</p>
          </div>
        </div>

        {dna.linguagens.length > 0 ? (
          <>
            <div className="grafico-linguagens">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dna.linguagens.slice(0, 6)}
                    dataKey="porcentagem"
                    nameKey="linguagem"
                    cx="50%"
                    cy="50%"
                    outerRadius={84}
                    innerRadius={53}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {dna.linguagens.slice(0, 6).map(
                      (linguagem, index) => (
                        <Cell
                          key={linguagem.linguagem}
                          fill={
                            CORES_GRAFICO[
                              index % CORES_GRAFICO.length
                            ]
                          }
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(valor) => [
                      `${valor}%`,
                      "Participação",
                    ]}
                    contentStyle={{
                      backgroundColor: "#101a2b",
                      border: "1px solid #287ce0",
                      borderRadius: "8px",
                      color: "#edf5ff",
                    }}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-lista-linguagens">
              {dna.linguagens.slice(0, 6).map((linguagem, index) => (
                <div
                  className="dashboard-linguagem"
                  key={linguagem.linguagem}
                >
                  <div className="dashboard-linguagem-cabecalho">
                    <span className="dashboard-linguagem-indice">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="dashboard-linguagem-nome">
                      {linguagem.linguagem}
                    </span>
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
  </section>

  {/* Pontuação */}
  <section className="dashboard-secao">
    <div className="dashboard-secao-cabecalho">
      <div>
        <span className="dashboard-sobretitulo">CRITÉRIOS DE ANÁLISE</span>
        <h3>Composição da pontuação</h3>
      </div>
      <span className="dashboard-contagem">03 / SCORE</span>
    </div>

    <article className="painel dashboard-painel-pontuacao">
      <div className="dashboard-pontuacao-intro">
        <span className="dashboard-pontuacao-intro-icone">
          <Trophy size={23} />
        </span>
        <div>
          <h3>Como seu resultado foi calculado</h3>
          <p>Indicadores experimentais baseados nos repositórios públicos.</p>
        </div>
      </div>

      <div className="dashboard-grade-pontuacao">
        {(
          [
            ["Diversidade", dna.pontuacao.indicadores.diversidade],
            ["Equilíbrio tecnológico", dna.pontuacao.indicadores.equilibrio],
            ["Experimentação", dna.pontuacao.indicadores.experimentacao],
            ["Reconhecimento", dna.pontuacao.indicadores.reconhecimento],
            ["Atividade", dna.pontuacao.indicadores.atividade],
          ] as const
        ).map(([nome, valor], index) => (
          <div className="dashboard-indicador" key={nome}>
            <div className="dashboard-indicador-topo">
              <span className="dashboard-indicador-indice">
                0{index + 1}
              </span>
              <span>{nome}</span>
              <strong>{valor}/25</strong>
            </div>

            <div className="barra-fundo">
              <div
                className="barra-preenchida barra-pontuacao"
                style={{
                  width: `${Math.min(100, Math.max(0, (valor / 25) * 100))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="aviso-pontuacao">
        <FlaskConical size={17} />
        Esta pontuação é experimental e considera apenas indicadores
        simples dos repositórios públicos. Não mede a habilidade real
        de uma pessoa desenvolvedora.
      </p>
    </article>
  </section>

  {/* Recomendações */}
  <section className="dashboard-secao">
    <div className="dashboard-secao-cabecalho">
      <div>
        <span className="dashboard-sobretitulo">PLANO DE EVOLUÇÃO</span>
        <h3>Seu próximo nível</h3>
      </div>
      <span className="dashboard-contagem">04 / PRÓXIMOS PASSOS</span>
    </div>

    <article className="painel dashboard-painel-recomendacoes">
      <div className="dashboard-recomendacoes-intro">
        <span className="dashboard-recomendacoes-icone">
          <Zap size={23} />
        </span>
        <div>
          <h3>Recomendações personalizadas</h3>
          <p>
            Sugestões geradas a partir dos dados identificados no seu perfil.
          </p>
        </div>
      </div>

      <ul className="lista-recomendacoes dashboard-lista-recomendacoes">
        {gerarRecomendacoes(dna).map((recomendacao, index) => (
          <li key={index}>
            <span className="recomendacao-numero">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="dashboard-recomendacao-texto">
              {recomendacao}
            </span>
            <span className="dashboard-recomendacao-seta">
              <Zap size={16} />
            </span>
          </li>
        ))}
      </ul>
    </article>
  </section>
</section>

        
        ) : null}

<section className="secao-recursos" id="recursos">
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

        <footer className="rodape">
          <a className="marca marca-rodape" href="#inicio">
            <Dna size={19} />
            Dev<span className="texto-destaque">DNA</span>
          </a>

          <span>Feito para explorar o universo do código.</span>
        </footer>
      </main>
    </>
  );
}

export default App;
