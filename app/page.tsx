import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Code2, Images, Layers3, Download, LockKeyhole } from "lucide-react";

const GITHUB_URL = "https://github.com/tecalediaz/AlPic";

export default function HomePage() {
  return (
    <main className="project-page">
      <header className="project-nav">
        <Link href="/" className="project-wordmark" aria-label="AlPic, inicio">Al<span>Pic</span><span className="project-wordmark-dot">.</span></Link>
        <nav aria-label="Navegación principal">
          <a href="#proyecto">El proyecto</a>
          <a href="#como-funciona">Cómo funciona</a>
          <Link href="/estilos/local" className="project-nav-demo">Abrir demo <ArrowUpRight size={15} /></Link>
        </nav>
      </header>

      <section className="project-hero" id="proyecto">
        <div className="project-hero-copy">
          <p className="project-kicker">Proyecto personal · Editor de imágenes</p>
          <h1>Un estilo propio para cada foto.</h1>
          <p className="project-intro">Diseñé y desarrollé AlPic para resolver una tarea repetitiva: preparar imágenes para redes sin reconstruir el diseño cada vez. Creás una plantilla, la aplicás a tus fotos y exportás el resultado.</p>
          <div className="project-actions">
            <Link href="/estilos/local" className="project-primary-link">Probar AlPic <ArrowUpRight size={18} /></Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="project-secondary-link"><Code2 size={18} /> Ver código en GitHub</a>
          </div>
          <p className="project-privacy-note"><LockKeyhole size={15} /> La demo guarda tus estilos en este navegador. Sin cuenta ni servidor de datos.</p>
        </div>
        <div className="project-visual" aria-label="Ejemplo de una imagen preparada con AlPic">
          <div className="project-visual-top"><span className="project-visual-brand">AlPic Studio</span><span>Vista previa · 9:16</span></div>
          <div className="project-visual-stage">
            <div className="project-poster">
              <Image src="/example-photo.jpg" alt="Fotografía de ejemplo dentro de una plantilla de AlPic" fill priority sizes="(max-width: 900px) 75vw, 330px" className="project-poster-image" />
              <div className="project-poster-shade" />
              <div className="project-poster-text"><span>CREÁ UNA VEZ</span><strong>Publicá<br />con estilo.</strong><small>Tu contenido, tu identidad visual.</small></div>
            </div>
          </div>
          <div className="project-visual-bottom"><span className="project-status-dot" /> Plantilla reutilizable <span>PNG listo para publicar</span></div>
        </div>
      </section>

      <section className="project-section project-how" id="como-funciona">
        <div className="project-section-head"><p className="project-kicker">El flujo</p><h2>De la plantilla a la imagen final</h2><p>El editor separa el diseño reutilizable de las fotos que vas cambiando.</p></div>
        <div className="project-steps">
          <article><span className="project-step-icon"><Layers3 size={24} /></span><span className="project-step-number">01</span><h3>Diseñá un estilo</h3><p>Armá una plantilla con texto, formas, colores y espacios para tus fotos. Elegí el formato de publicación.</p></article>
          <article><span className="project-step-icon"><Images size={24} /></span><span className="project-step-number">02</span><h3>Probalo con una foto</h3><p>Subí una imagen desde tu equipo. Ajustá el contenido sobre la plantilla sin alterar el estilo original.</p></article>
          <article><span className="project-step-icon"><Download size={24} /></span><span className="project-step-number">03</span><h3>Descargá el resultado</h3><p>Exportá un PNG y repetí el proceso con otra foto para mantener una identidad consistente.</p></article>
        </div>
      </section>

      <section className="project-section project-about">
        <div><p className="project-kicker">Detrás de AlPic</p><h2>Una herramienta hecha para simplificar un trabajo real.</h2></div>
        <div><p>Este es un proyecto de mi portfolio: diseño de producto, interfaz y desarrollo en Next.js, React y Fabric.js. La demo funciona en tu navegador y conserva los estilos localmente para que puedas explorar el flujo completo.</p><p>El código está disponible para leerlo, ejecutarlo y mejorarlo. Para editar cómodamente las plantillas, usá una computadora.</p><div className="project-about-links"><Link href="/estilos/local">Abrir la herramienta <ArrowUpRight size={17} /></Link><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">Explorar el repositorio <ArrowUpRight size={17} /></a></div></div>
      </section>

      <footer className="project-footer"><span>AlPic — proyecto de <a href="https://tecalediaz.com" target="_blank" rel="noopener noreferrer">tecalediaz</a></span><a href="#proyecto">Volver arriba ↑</a></footer>
    </main>
  );
}
