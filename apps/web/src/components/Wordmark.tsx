import { Link } from "react-router";
import "./Wordmark.css";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`wordmark ${className}`} aria-label="SmashRecap home">
      <span className="wordmark__led" aria-hidden="true" />
      SmashRecap
    </Link>
  );
}
