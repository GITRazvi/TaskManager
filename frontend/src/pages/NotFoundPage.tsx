// File responsibility: Renders the fallback page for unmatched routes.
import { Link } from "react-router-dom";

/**
 * Renders the fallback screen for routes that do not match the app route tree.
 */
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
