
import { useState, type FormEvent } from "react";

import {
  Search,
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
    totalEstrelas: number;
    totalBifurcacoes: number;
    repositoriosAtivos: number;
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
                ["Diversidade", dna.pontuacao.indicadores.diversidade],
                ["Experimentação", dna.pontuacao.indicadores.experimentacao],
                ["Reconhecimento", dna.pontuacao.indicadores.reconhecimento],
                ["Atividade", dna.pontuacao.indicadores.atividade],
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
