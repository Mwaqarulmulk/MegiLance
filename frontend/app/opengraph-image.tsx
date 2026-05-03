// @AI-HINT: Auto-generates the site-wide OpenGraph image using Next.js file convention.
// Uses the real MegiLance ML lettermark logo from the navbar.
// This generates a proper 1200x630 PNG at build time — no static placeholder needed.
// See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
import { ImageResponse } from 'next/og';

export const alt = 'MegiLance – AI-Powered Freelance Marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// ── Real MegiLance ML lettermark (simplified for OG context) ──────────────────
// Matches the navbar logo: dark bg, white ML strokes, blue accent dots.
// Simplified from the full logo-icon.svg to reduce inline size while keeping
// identical visual identity at the rendered size (~130px in the card).
const LOGO_SVG = [
  '<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">',
  '<rect width="400" height="400" rx="40" fill="#1D2127"/>',
  // M: two verticals + V
  '<path d="M75 300V97" stroke="#EAF6FF" stroke-width="25" stroke-linecap="round"/>',
  '<path d="M200 300V97" stroke="#EAF6FF" stroke-width="25" stroke-linecap="round"/>',
  '<path d="M75 97L137.5 191" stroke="#EAF6FF" stroke-width="25" stroke-linecap="round"/>',
  '<path d="M200 97L137.5 191" stroke="#EAF6FF" stroke-width="25" stroke-linecap="round"/>',
  // L: vertical + foot
  '<path d="M247 97V300" stroke="#EAF6FF" stroke-width="25" stroke-linecap="round"/>',
  '<path d="M247 300H325" stroke="#EAF6FF" stroke-width="25" stroke-linecap="round"/>',
  // Blue accent dots (outer ring + white center)
  '<circle cx="75" cy="97" r="18" fill="#4573DF"/><circle cx="75" cy="97" r="8" fill="white"/>',
  '<circle cx="200" cy="97" r="18" fill="#4573DF"/><circle cx="200" cy="97" r="8" fill="white"/>',
  '<circle cx="137.5" cy="191" r="18" fill="#4573DF"/><circle cx="137.5" cy="191" r="8" fill="white"/>',
  '<circle cx="247" cy="97" r="18" fill="#4573DF"/><circle cx="247" cy="97" r="8" fill="white"/>',
  '<circle cx="247" cy="300" r="18" fill="#4573DF"/><circle cx="247" cy="300" r="8" fill="white"/>',
  '<circle cx="325" cy="300" r="18" fill="#4573DF"/><circle cx="325" cy="300" r="8" fill="white"/>',
  '</svg>',
].join('');

export default function Image() {
  const logoUri = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(145deg, #0B0F19 0%, #1D2127 50%, #131720 100%)',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* ── Main content ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo icon */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUri}
            width={130}
            height={130}
            alt=""
          />

          {/* Brand name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-2px',
              lineHeight: 1,
              marginTop: 24,
            }}
          >
            MegiLance
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 26,
              color: '#94a3b8',
              marginTop: 16,
            }}
          >
            AI-Powered Freelance Marketplace
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: 'flex',
              marginTop: 32,
              gap: 16,
            }}
          >
            {['Hire Top Talent', 'Secure Payments', 'Smart AI Matching'].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(69,115,223,0.12)',
                    borderRadius: 999,
                    padding: '8px 20px',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#4573DF',
                    }}
                  />
                  <span style={{ fontSize: 16, color: '#6b93f5' }}>{label}</span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* ── Bottom accent gradient bar ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 6,
            background:
              'linear-gradient(90deg, #4573DF 0%, #6b93f5 50%, #9b59b6 100%)',
          }}
        />

        {/* ── Subtle corner decoration ── */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            right: 40,
            fontSize: 16,
            color: 'rgba(148,163,184,0.4)',
          }}
        >
          megilance.com
        </div>
      </div>
    ),
    { ...size },
  );
}
