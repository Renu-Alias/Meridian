import { useParams } from 'react-router-dom';
import { FeedPage } from './FeedPage';

export function HashtagPage() {
  const { tag } = useParams<{ tag: string }>();
  return <FeedPage tag={tag} />;
}
