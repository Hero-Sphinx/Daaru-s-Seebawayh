/**
 * Small inline-SVG icon set. Kept local (no icon-font CDN) so the app has no
 * external runtime dependency for anything but fonts, matching the rest of
 * the stack's "no unnecessary external calls" posture.
 */

import type { ReactNode } from "react";

export type IconProps = { className?: string };

function base(paths: ReactNode) {
  return function Icon({ className = "w-5 h-5" }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        {paths}
      </svg>
    );
  };
}

export const HouseIcon = base(<path d="M3 11.5 12 4l9 7.5M5 10v9h5v-6h4v6h5v-9" />);

export const BookIcon = base(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5a2.5 2.5 0 0 1 2.5 2.5V5.5Z" />
  </>
);

// Open book on a lectern (rahl) — the Qur'an reader.
export const MushafIcon = base(
  <>
    <path d="M12 6c-2-1.5-5-2-8-1.5V16c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6Z" />
    <path d="M12 6v11.5M6 21l6-3.5 6 3.5" />
  </>
);

export const DiagramIcon = base(
  <>
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <rect x="3" y="17" width="6" height="4" rx="1" />
    <rect x="15" y="17" width="6" height="4" rx="1" />
    <path d="M12 7v5M12 12 6 17M12 12l6 5" />
  </>
);

export const ScrollIcon = base(
  <>
    <path d="M6 4h11a2 2 0 0 1 2 2v13a1.5 1.5 0 0 1-3 0V6" />
    <path d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11" />
    <path d="M8 9h7M8 13h5" />
  </>
);

export const QuizIcon = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 1-1 1.7" />
    <path d="M12 17h.01" />
  </>
);

export const AwardIcon = base(
  <>
    <circle cx="12" cy="8" r="5" />
    <path d="m8.5 12.5-1.6 7.6L12 18l5.1 2.1-1.6-7.6" />
  </>
);

export const GraduationCapIcon = base(
  <>
    <path d="m2 9 10-4 10 4-10 4-10-4Z" />
    <path d="M6 11v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
    <path d="M22 9v6" />
  </>
);

export const PlayIcon = base(<path d="M7 4.5v15l13-7.5-13-7.5Z" />);

export const ArrowRightIcon = base(<path d="M4 12h16M13 5l7 7-7 7" />);

export const ChevronLeftIcon = base(<path d="M15 6l-6 6 6 6" />);

export const ChevronRightIcon = base(<path d="M9 6l6 6-6 6" />);

export const CheckIcon = base(<path d="M20 6 9 17l-5-5" />);

export const XIcon = base(<path d="M18 6 6 18M6 6l12 12" />);

export const TrashIcon = base(
  <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m3 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7h14ZM10 11v6M14 11v6" />
);

export const VolumeIcon = base(
  <>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
    <path d="M17 9a4 4 0 0 1 0 6" />
  </>
);

export const LightbulbIcon = base(
  <>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.7h5.6c0-.7.3-1.3.8-1.7A6 6 0 0 0 12 3Z" />
  </>
);

export const SunIcon = base(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </>
);

export const MoonIcon = base(<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />);

export const SlidersIcon = base(
  <>
    <path d="M4 6h8M16 6h4M4 12h11M19 12h1M4 18h5M13 18h7" />
    <circle cx="14" cy="6" r="2" />
    <circle cx="9" cy="12" r="2" />
    <circle cx="14" cy="18" r="2" />
  </>
);
