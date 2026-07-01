import type { SVGProps } from "react";
import type { Archetype } from "@/types/exercise";

interface ArchetypeIconProps {
  archetype: Archetype;
}

const svgProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/**
 * Simple, hand-drawn line-art pictograms standing in for real exercise
 * photos/GIFs, which the free dataset doesn't include (see docs/PLAN.md).
 * One icon per movement-pattern archetype, not per exercise -- purely
 * decorative, so callers should wrap this with aria-hidden.
 */
export function ArchetypeIcon({ archetype }: ArchetypeIconProps) {
  switch (archetype) {
    case "squat":
      return (
        <svg {...svgProps}>
          <path d="M7 8l5 4 5-4" />
          <path d="M7 16l5-4 5 4" />
        </svg>
      );
    case "hinge":
      return (
        <svg {...svgProps}>
          <path d="M6 6v8h8" />
          <circle cx="6" cy="14" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "push":
      return (
        <svg {...svgProps}>
          <path d="M12 20V8" />
          <path d="M8 12l4-4 4 4" />
          <path d="M6 20h12" />
        </svg>
      );
    case "pull":
      return (
        <svg {...svgProps}>
          <path d="M12 4v12" />
          <path d="M8 12l4 4 4-4" />
          <path d="M6 20h12" />
        </svg>
      );
    case "lunge":
      return (
        <svg {...svgProps}>
          <rect x="6" y="12" width="3" height="8" fill="currentColor" stroke="none" />
          <rect x="15" y="4" width="3" height="16" fill="currentColor" stroke="none" />
        </svg>
      );
    case "raise":
      return (
        <svg {...svgProps}>
          <path d="M6 18L18 6" />
          <path d="M10 6h8v8" />
        </svg>
      );
    case "plank":
      return (
        <svg {...svgProps}>
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="7" y1="8" x2="7" y2="16" />
          <line x1="17" y1="8" x2="17" y2="16" />
        </svg>
      );
    case "rotation":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 5l3 2-3 2" />
        </svg>
      );
    case "cardio":
      return (
        <svg {...svgProps}>
          <path d="M2 12h4l2-5 4 10 3-8 3 3h4" />
        </svg>
      );
    case "unclassified":
    default:
      return (
        <svg {...svgProps}>
          <circle cx="5" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <line x1="5" y1="9" x2="5" y2="15" />
          <line x1="19" y1="9" x2="19" y2="15" />
          <line x1="7.5" y1="12" x2="16.5" y2="12" />
        </svg>
      );
  }
}
