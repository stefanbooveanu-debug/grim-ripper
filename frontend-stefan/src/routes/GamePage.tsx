import { GameCanvas } from '../components/GameCanvas';
import './GamePage.css';

export function GamePage() {
  return (
    <div className="game-page">
      <header className="game-page-header">
        <h1>Visual demo</h1>
        <p>Prototype interaction layer — branding &amp; UX stress test</p>
      </header>
      <GameCanvas />
    </div>
  );
}
