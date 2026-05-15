import './Overlays.css';

interface GameOverOverlayProps {
  score: number;
  onRetry: () => void;
}

export function GameOverOverlay({ score, onRetry }: GameOverOverlayProps) {
  return (
    <div className="overlay">
      <h2>Veil fallen</h2>
      <p className="overlay-score">{score}</p>
      <p>Your harvest is complete.</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
