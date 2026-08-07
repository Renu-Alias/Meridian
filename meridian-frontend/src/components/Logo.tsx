import { Link } from 'react-router-dom';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <img
      src="/logo-icon.png"
      alt=""
      aria-hidden="true"
      className={`block h-12 w-12 shrink-0 object-contain brightness-0 invert ${className}`}
    />
  );
}

type BrandMarkProps = {
  className?: string;
  to?: string;
  showSubtitle?: boolean;
  nameClassName?: string;
  subtitleClassName?: string;
};

export function BrandMark({
  className = '',
  to = '/',
  showSubtitle = false,
  nameClassName = 'text-lg font-medium leading-none text-[#e7e9ea]',
  subtitleClassName = 'mt-1 block text-sm font-medium text-[#536471]',
}: BrandMarkProps) {
  return (
    <Link to={to} className={`flex items-center gap-3 ${className}`} aria-label="Meridian home">
      <Logo />
      <span>
        <span className={`block ${nameClassName}`}>Meridian</span>
        {showSubtitle && <span className={subtitleClassName}>Engineer Network</span>}
      </span>
    </Link>
  );
}
