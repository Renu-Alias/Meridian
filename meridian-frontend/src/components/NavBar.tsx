import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="flex flex-col h-full space-y-4">
      <div className="text-2xl font-bold text-primary mb-6">Meridian</div>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `block py-2 px-3 rounded hover:bg-muted ${isActive ? 'bg-verified text-surface' : ''}`
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/feed"
        className={({ isActive }) =>
          `block py-2 px-3 rounded hover:bg-muted ${isActive ? 'bg-verified text-surface' : ''}`
        }
      >
        Feed
      </NavLink>
      <NavLink
        to="/editor"
        className={({ isActive }) =>
          `block py-2 px-3 rounded hover:bg-muted ${isActive ? 'bg-verified text-surface' : ''}`
        }
      >
        Write
      </NavLink>
      <button className="mt-auto py-2 px-4 bg-verified text-surface rounded hover:opacity-90 transition">
        Join Meridian
      </button>
    </nav>
  );
}
