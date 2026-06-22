import { Link } from 'react-router-dom';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <img
      src="/logo-icon.png"
      alt=""
      aria-hidden="true"
      className={`block h-8 w-8 shrink-0 object-contain brightness-0 invert ${className}`}
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
  to = '/discover',
  showSubtitle = false,
  nameClassName = 'text-[15px] font-medium leading-none text-[#e7e9ea]',
  subtitleClassName = 'mt-0.5 block text-[12px] font-medium text-[#536471]',
}: BrandMarkProps) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 ${className}`} aria-label="Meridian home">
      <Logo />
      <span>
        <span className={`block ${nameClassName}`}>Meridian</span>
        {showSubtitle && <span className={subtitleClassName}>Engineer Network</span>}
      </span>
    </Link>
  );
}
