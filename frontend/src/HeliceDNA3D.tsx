
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./HeliceDNA3D.css";

export default function HeliceDNA3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // CENA
    const cena = new THREE.Scene();

    // CÂMERA
    const obterDimensoes = () => ({
      largura: container.clientWidth || window.innerWidth,
      altura: container.clientHeight || window.innerHeight,
    });

    const dimensoes = obterDimensoes();

    const camera = new THREE.PerspectiveCamera(
      42,
      dimensoes.largura / dimensoes.altura,
      0.1,
      1000
    );

    camera.position.set(0, 0, 15);

    // RENDERIZADOR
    const renderizador = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    renderizador.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderizador.setSize(
      dimensoes.largura,
      dimensoes.altura
    );

    renderizador.outputColorSpace = THREE.SRGBColorSpace;
    renderizador.setClearColor(0x000000, 0);

    container.appendChild(renderizador.domElement);

    // ILUMINAÇÃO
    cena.add(new THREE.AmbientLight(0x83d5ff, 1.2));

    const luzAzul = new THREE.PointLight(0x48a9ff, 8, 30);
    luzAzul.position.set(5, 3, 7);
    cena.add(luzAzul);

    const luzCiano = new THREE.PointLight(0x43e0e8, 6, 25);
    luzCiano.position.set(-5, -2, 5);
    cena.add(luzCiano);

    const luzRosa = new THREE.PointLight(0xa995ff, 5, 20);
    luzRosa.position.set(0, 5, -3);
    cena.add(luzRosa);

    // GRUPO PRINCIPAL DO DNA
    const dna = new THREE.Group();
    dna.scale.set(1.15, 1.15, 1.15);
    dna.rotation.z = THREE.MathUtils.degToRad(-8);
    cena.add(dna);

    // CONFIGURAÇÃO DA HÉLICE
    const raio = 2.15;
    const altura = 11;
    const voltas = 2.7;
    const quantidadePontos = 260;

    const pontosA: THREE.Vector3[] = [];
    const pontosB: THREE.Vector3[] = [];

    for (let i = 0; i <= quantidadePontos; i++) {
      const progresso = i / quantidadePontos;
      const y = -altura / 2 + progresso * altura;
      const angulo = progresso * Math.PI * 2 * voltas;

      const x = Math.cos(angulo) * raio;
      const z = Math.sin(angulo) * raio;

      pontosA.push(new THREE.Vector3(x, y, z));
      pontosB.push(new THREE.Vector3(-x, y, -z));
    }

    // MATERIAIS DAS FITAS
    const materialA = new THREE.MeshPhysicalMaterial({
      color: 0x48a9ff,
      emissive: 0x1764c0,
      emissiveIntensity: 1.8,
      metalness: 0.35,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.94,
    });

    const materialB = new THREE.MeshPhysicalMaterial({
      color: 0x43e0e8,
      emissive: 0x087d91,
      emissiveIntensity: 1.6,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.92,
    });

    // TUBOS 3D
    const curvaA = new THREE.CatmullRomCurve3(pontosA);
    const curvaB = new THREE.CatmullRomCurve3(pontosB);

    const geometriaA = new THREE.TubeGeometry(
      curvaA,
      320,
      0.095,
      12,
      false
    );

    const geometriaB = new THREE.TubeGeometry(
      curvaB,
      320,
      0.095,
      12,
      false
    );

    dna.add(new THREE.Mesh(geometriaA, materialA));
    dna.add(new THREE.Mesh(geometriaB, materialB));

    // LIGAÇÕES ENTRE AS FITAS
    const materialLigacao = new THREE.MeshPhysicalMaterial({
      color: 0x83d5ff,
      emissive: 0x1764c0,
      emissiveIntensity: 1.4,
      metalness: 0.2,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85,
    });

    const geometriasLigacao: THREE.BufferGeometry[] = [];

    function criarLigacao(
      inicio: THREE.Vector3,
      fim: THREE.Vector3
    ) {
      const direcao = new THREE.Vector3().subVectors(fim, inicio);
      const comprimento = direcao.length();

      const geometria = new THREE.CylinderGeometry(
        0.045,
        0.045,
        comprimento,
        8
      );

      geometriasLigacao.push(geometria);

      const objeto = new THREE.Mesh(geometria, materialLigacao);

      objeto.position
        .copy(inicio)
        .add(fim)
        .multiplyScalar(0.5);

      objeto.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direcao.normalize()
      );

      dna.add(objeto);
    }

    for (let i = 8; i < quantidadePontos; i += 13) {
      const a = pontosA[i];
      const b = pontosB[i];

      if (a && b) criarLigacao(a, b);
    }

    // ESFERAS LUMINOSAS
    const geometriaParticula = new THREE.SphereGeometry(
      0.11,
      10,
      10
    );

    const materialParticulaA = new THREE.MeshBasicMaterial({
      color: 0x83d5ff,
    });

    const materialParticulaB = new THREE.MeshBasicMaterial({
      color: 0x43e0e8,
    });

    for (let i = 0; i < quantidadePontos; i += 8) {
      const a = pontosA[i];
      const b = pontosB[i];

      if (!a || !b) continue;

      const pontoA = new THREE.Mesh(
        geometriaParticula,
        materialParticulaA
      );

      pontoA.position.copy(a);
      dna.add(pontoA);

      const pontoB = new THREE.Mesh(
        geometriaParticula,
        materialParticulaB
      );

      pontoB.position.copy(b);
      dna.add(pontoB);
    }

    // PARTÍCULAS ESPACIAIS
    const quantidadeParticulas = 900;

    const posicoes = new Float32Array(
      quantidadeParticulas * 3
    );

    for (let i = 0; i < quantidadeParticulas; i++) {
      const indice = i * 3;

      posicoes[indice] = (Math.random() - 0.5) * 25;
      posicoes[indice + 1] = (Math.random() - 0.5) * 18;
      posicoes[indice + 2] = (Math.random() - 0.5) * 18;
    }

    const geometriaEstrelas = new THREE.BufferGeometry();

    geometriaEstrelas.setAttribute(
      "position",
      new THREE.BufferAttribute(posicoes, 3)
    );

    const materialEstrelas = new THREE.PointsMaterial({
      color: 0x83d5ff,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
    });

    const estrelas = new THREE.Points(
      geometriaEstrelas,
      materialEstrelas
    );

    cena.add(estrelas);

    // ANIMAÇÃO
    let animacao = 0;
    let ativo = true;

    const relogio = new THREE.Clock();

    function animar() {
      if (!ativo) return;

      const tempo = relogio.getElapsedTime();

      dna.rotation.y = tempo * 0.18;
      dna.position.y = Math.sin(tempo * 0.35) * 0.15;

      estrelas.rotation.y = tempo * 0.008;
      estrelas.rotation.x = Math.sin(tempo * 0.05) * 0.03;

      renderizador.render(cena, camera);

      animacao = requestAnimationFrame(animar);
    }

    animar();

    // RESPONSIVIDADE
    function redimensionar() {
      const { largura, altura } = obterDimensoes();

      camera.aspect = largura / altura;
      camera.updateProjectionMatrix();

      renderizador.setSize(largura, altura);
      renderizador.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
      );

      if (window.innerWidth < 900) {
        camera.position.z = 18;
        dna.scale.set(0.9, 0.9, 0.9);
      } else {
        camera.position.z = 15;
        dna.scale.set(1.15, 1.15, 1.15);
      }

      renderizador.render(cena, camera);
    }

    const observador = new ResizeObserver(redimensionar);
    observador.observe(container);

    window.addEventListener("resize", redimensionar);

    redimensionar();

    // LIMPEZA
    return () => {
      ativo = false;
      cancelAnimationFrame(animacao);

      observador.disconnect();
      window.removeEventListener("resize", redimensionar);

      geometriaA.dispose();
      geometriaB.dispose();
      geometriaEstrelas.dispose();
      geometriaParticula.dispose();

      geometriasLigacao.forEach((geometria) => geometria.dispose());

      materialA.dispose();
      materialB.dispose();
      materialLigacao.dispose();
      materialParticulaA.dispose();
      materialParticulaB.dispose();
      materialEstrelas.dispose();

      renderizador.dispose();

      if (container.contains(renderizador.domElement)) {
        container.removeChild(renderizador.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="helice-dna-3d"
      aria-hidden="true"
    />
  );
}
