import { Helmet } from 'react-helmet-async';

export default function Feed() {
  return (
    <section className="p-6">
      <Helmet>
        <title>Meridian – Feed</title>
        <meta name="description" content="Personalized feed of stack‑matched posts." />
      </Helmet>
      <h2 className="text-2xl font-bold mb-4 text-primary">Feed</h2>
      <p className="text-muted">Coming soon: a dynamic feed of posts tailored to your tech stack.</p>
    </section>
  );
}
