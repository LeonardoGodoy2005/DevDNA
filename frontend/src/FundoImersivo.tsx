
import { useEffect, useRef } from "react";
import "./FundoImersivo.css";

export default function FundoImersivo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");

    if (!canvas || !contexto) return;

    let largura = 0;
    let altura = 0;
    let animacao = 0;

    type Particula = {
      x: number;
      y: number;
      raio: number;
      velocidadeX: number;
      velocidadeY: number;
      opacidade: number;
    };

    let particulas: Particula[] = [];

    const ajustarTela = () => {
      const escala = Math.min(window.devicePixelRatio || 1, 2);

      largura = window.innerWidth;
      altura = window.innerHeight;

      canvas.width = largura * escala;
      canvas.height = altura * escala;
      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;

      contexto.setTransform(escala, 0, 0, escala, 0, 0);

      const quantidade = Math.min(
        Math.floor((largura * altura) / 14000),
        100
      );

      particulas = Array.from({ length: quantidade }, () => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        raio: Math.random() * 1.5 + 0.4,
        velocidadeX: (Math.random() - 0.5) * 0.25,
        velocidadeY: (Math.random() - 0.5) * 0.25,
        opacidade: Math.random() * 0.45 + 0.12,
      }));
    };

    const desenhar = () => {
      contexto.clearRect(0, 0, largura, altura);

      const gradiente = contexto.createRadialGradient(
        largura * 0.5,
        altura * 0.4,
        0,
        largura * 0.5,
        altura * 0.4,
        Math.max(largura, altura) * 0.8
      );

      gradiente.addColorStop(0, "rgba(112, 78, 190, 0.10)");
      gradiente.addColorStop(0.5, "rgba(37, 30, 65, 0.06)");
      gradiente.addColorStop(1, "rgba(10, 10, 16, 0)");

      contexto.fillStyle = gradiente;
      contexto.fillRect(0, 0, largura, altura);

      particulas.forEach((particula, indice) => {
        particula.x += particula.velocidadeX;
        particula.y += particula.velocidadeY;

        if (particula.x < 0 || particula.x > largura) {
          particula.velocidadeX *= -1;
        }

        if (particula.y < 0 || particula.y > altura) {
          particula.velocidadeY *= -1;
        }

        contexto.beginPath();
        contexto.arc(
          particula.x,
          particula.y,
          particula.raio,
          0,
          Math.PI * 2
        );

        contexto.fillStyle = `rgba(190, 170, 255, ${particula.opacidade})`;
        contexto.fill();

        for (let i = indice + 1; i < particulas.length; i++) {
          const outra = particulas[i];
          const distanciaX = particula.x - outra.x;
          const distanciaY = particula.y - outra.y;
          const distancia = Math.sqrt(
            distanciaX * distanciaX + distanciaY * distanciaY
          );

          if (distancia < 110) {
            contexto.beginPath();
            contexto.moveTo(particula.x, particula.y);
            contexto.lineTo(outra.x, outra.y);

            contexto.strokeStyle = `rgba(169, 149, 255, ${
              0.09 * (1 - distancia / 110)
            })`;

            contexto.lineWidth = 0.6;
            contexto.stroke();
          }
        }
      });

      animacao = requestAnimationFrame(desenhar);
    };

    ajustarTela();
    desenhar();

    window.addEventListener("resize", ajustarTela);

    return () => {
      cancelAnimationFrame(animacao);
      window.removeEventListener("resize", ajustarTela);
    };
  }, []);

  return (
    <div className="fundo-imersivo" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
