import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>Page Not Found</h1>
      <Link className="primary-button" to="/">
        Return to dashboard
      </Link>
    </main>
  );
}
