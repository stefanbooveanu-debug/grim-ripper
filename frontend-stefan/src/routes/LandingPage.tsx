import { Link } from 'react-router-dom';
import { DEMO_STEPS, PROJECT, SECTIONS } from '../content/hacktm';
import { InfoCard } from '../components/InfoCard';
import '../components/shared.css';
import './LandingPage.css';

export function LandingPage() {
  return (
    <div className={`landing ${document.documentElement.classList.contains('presentation') ? 'landing--presentation' : ''}`}>
      <header className="landing-hero">
        <p className="landing-track">{PROJECT.track} · HackTM 2026</p>
        <h1 className="landing-title">{PROJECT.name}</h1>
        <p className="landing-tagline">{PROJECT.tagline}</p>
        <div className="landing-cta">
          <Link to="/builder" className="btn btn-primary">
            Script builder
          </Link>
          <Link to="/console" className="btn">
            Operations console
          </Link>
          <Link to="/logs" className="btn">
            View logs
          </Link>
          <Link to="/play" className="btn">
            Visual demo
          </Link>
        </div>
        <p className="landing-hint">
          Press <kbd>P</kbd> to jump to console during pitch
        </p>
      </header>

      <section className="landing-cards" aria-label="Project overview">
        {SECTIONS.map((s) => (
          <InfoCard key={s.id} title={s.title} body={s.body} />
        ))}
      </section>

      <section className="landing-demo" aria-labelledby="demo-heading">
        <h2 id="demo-heading" className="section-title">
          Demo script
        </h2>
        <ol className="demo-steps">
          {DEMO_STEPS.map((step, i) => (
            <li key={step}>
              <span className="demo-num">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
