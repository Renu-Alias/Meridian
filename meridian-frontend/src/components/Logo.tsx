export function Logo({ className = '' }: { className?: string }) {
  return (
    <img
      src="/logo1.png"
      alt="Meridian"
      className={`block h-8 w-auto object-contain ${className}`}
    />
  );
}
