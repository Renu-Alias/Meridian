import { Helmet } from 'react-helmet-async';
import NetworkCanvas from '../components/NetworkCanvas';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen space-y-8">
      <Helmet>
        <title>Meridian – Knowledge Unfolding</title>
        <meta name="description" content="Meridian: Where code and community cultivate impact." />
      </Helmet>
      <NetworkCanvas />
      <h1 className="text-4xl font-bold text-primary">Meridian: Where Code and Community Cultivate Impact</h1>
      <p className="text-lg text-muted text-center max-w-xl">
        Connect with the best minds, build living knowledge, and get rewarded for value, not views.
      </p>
      <div className="flex space-x-4">
        <Link to="/feed" className="px-6 py-3 bg-verified text-surface rounded hover:opacity-90 transition">
          Join Meridian
        </Link>
        <Link to="/about" className="px-6 py-3 bg-surface border border-muted text-primary rounded hover:bg-muted transition">
          Learn More
        </Link>
      </div>
    </section>
  );
}
