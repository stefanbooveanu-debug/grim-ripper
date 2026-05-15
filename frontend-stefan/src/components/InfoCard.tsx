import './InfoCard.css';

interface InfoCardProps {
  title: string;
  body: string;
}

export function InfoCard({ title, body }: InfoCardProps) {
  return (
    <article className="info-card">
      <h2 className="info-card-title">{title}</h2>
      <p className="info-card-body">{body}</p>
    </article>
  );
}
