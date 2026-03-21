// Diamond Shape Icons - 24x24 viewBox, 1px stroke, no fill

interface ShapeIconProps {
  className?: string;
}

export function BaguetteIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <rect x="8" y="4" width="8" height="16" rx="1" />
    </svg>
  );
}

export function HeartIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 9 0 4.5 4.5 0 0 1 9 0c0 5.5-8 11-8 11z" />
    </svg>
  );
}

export function CushionIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
    </svg>
  );
}

export function OvalIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <ellipse cx="12" cy="12" rx="6" ry="8" />
    </svg>
  );
}

export function EmeraldIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <path d="M7 4h10l3 3v10l-3 3H7l-3-3V7l3-3z" />
    </svg>
  );
}

export function PearIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <path d="M12 3c-3 3-6 6-6 10a6 6 0 0 0 12 0c0-4-3-7-6-10z" />
    </svg>
  );
}

export function KiteIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <path d="M12 2l6 8-6 12-6-12 6-8z" />
    </svg>
  );
}

export function PrincessIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <rect x="4" y="4" width="16" height="16" />
    </svg>
  );
}

export function MarquiseIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <path d="M12 2c-4 4-6 6-6 10s2 6 6 10c4-4 6-6 6-10s-2-6-6-10z" />
    </svg>
  );
}

export function RoundIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function TrillionIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <path d="M12 3l9 16H3l9-16z" />
    </svg>
  );
}

export function RadiantIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

// Category icons for Shop menu
export function RingIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EarringIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <circle cx="12" cy="6" r="2" />
      <path d="M12 8v2" />
      <path d="M8 14c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4-4 1.8-4 4z" />
    </svg>
  );
}

export function PendantIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <path d="M12 3v4" />
      <path d="M8 3h8" />
      <path d="M9 7l3 3 3-3" />
      <circle cx="12" cy="15" r="5" />
    </svg>
  );
}

export function BraceletIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <ellipse cx="12" cy="12" rx="8" ry="4" />
      <path d="M4 12c0 2.2 3.6 4 8 4s8-1.8 8-4" />
    </svg>
  );
}

export function NecklaceIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <path d="M6 6c0 6 3 10 6 12 3-2 6-6 6-12" />
      <circle cx="12" cy="18" r="2" />
    </svg>
  );
}

export function DiamondIcon({ className }: ShapeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
      <path d="M6 3h12l4 7-10 11L2 10l4-7z" />
      <path d="M2 10h20" />
      <path d="M12 21l-4-11h8l-4 11z" />
    </svg>
  );
}

// Shape data for easy iteration
export const diamondShapes = [
  { name: "Baguette", slug: "baguette", Icon: BaguetteIcon },
  { name: "Heart", slug: "heart", Icon: HeartIcon },
  { name: "Cushion", slug: "cushion", Icon: CushionIcon },
  { name: "Oval", slug: "oval", Icon: OvalIcon },
  { name: "Emerald", slug: "emerald", Icon: EmeraldIcon },
  { name: "Pear", slug: "pear", Icon: PearIcon },
  { name: "Kite", slug: "kite", Icon: KiteIcon },
  { name: "Princess", slug: "princess", Icon: PrincessIcon },
  { name: "Marquise", slug: "marquise", Icon: MarquiseIcon },
  { name: "Round", slug: "round", Icon: RoundIcon },
  { name: "Trillion", slug: "trillion", Icon: TrillionIcon },
  { name: "Radiant", slug: "radiant", Icon: RadiantIcon },
] as const;

// Solitaire shapes (subset)
export const solitaireShapes = [
  { name: "Emerald", slug: "emerald", Icon: EmeraldIcon },
  { name: "Heart", slug: "heart", Icon: HeartIcon },
  { name: "Marquise", slug: "marquise", Icon: MarquiseIcon },
  { name: "Round", slug: "round", Icon: RoundIcon },
  { name: "Trillion", slug: "trillion", Icon: TrillionIcon },
  { name: "Radiant", slug: "radiant", Icon: RadiantIcon },
] as const;

// Category icons mapping
export const categoryIcons = {
  rings: RingIcon,
  earrings: EarringIcon,
  pendants: PendantIcon,
  bracelets: BraceletIcon,
  necklaces: NecklaceIcon,
} as const;
