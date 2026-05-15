import './Overlays.css';

interface StartOverlayProps {
  onStart: () => void;
}

export function StartOverlay({ onStart }: StartOverlayProps) {
  return (
    <div className="overlay">
      <h2>Grim Dropper</h2>
      <p>Release falling souls into the chalice. Miss three and the veil falls.</p>
      <button type="button" className="btn btn-primary" onClick={onStart}>
        Enter the void
      </button>
    </div>
  );
}
