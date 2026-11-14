import { Link } from "react-router";
import "./Wordmark.css";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`wordmark ${className}`} aria-label="SmashRecap home">
      <img className="wordmark__mark" src="/favicon.svg" alt="" width={16} height={16} />
      SmashRecap
    </Link>
  );
}
