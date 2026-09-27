import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="hero-section not-found-section">
        <div className="hero-copy">
          <p className="kicker">Error 404</p>
          <h1>Lost track of time</h1>
          <p>This page doesn’t exist. The primer is right this way.</p>
          <div className="hero-actions">
            <Link href="/">
              Back to the primer <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
