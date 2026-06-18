import { Helmet } from 'react-helmet-async';

export default function Editor() {
  return (
    <section className="p-6">
      <Helmet>
        <title>Meridian – Editor</title>
        <meta name="description" content="Compose and edit Meridian posts." />
      </Helmet>
      <h2 className="text-2xl font-bold mb-4 text-primary">Editor</h2>
      <p className="text-muted">Editor UI will be implemented here.</p>
    </section>
  );
}
