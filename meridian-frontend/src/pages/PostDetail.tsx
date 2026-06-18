import { Helmet } from 'react-helmet-async';

export default function PostDetail() {
  return (
    <section className="p-6">
      <Helmet>
        <title>Meridian – Post Detail</title>
        <meta name="description" content="Detailed view of a Meridian post." />
      </Helmet>
      <h2 className="text-2xl font-bold mb-4 text-primary">Post Detail</h2>
      <p className="text-muted">Post content will be displayed here.</p>
    </section>
  );
}
