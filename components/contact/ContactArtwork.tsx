import type { ReactElement } from 'react';

export type ContactKind = 'github' | 'linkedin' | 'email' | 'resume';

function RepositoryArtwork(): ReactElement {
  return (
    <svg viewBox="0 0 260 164" fill="none" aria-hidden="true" focusable="false">
      <rect x="25.5" y="4.5" width="217" height="150" rx="6" fill="#a8b3c1" fillOpacity="0.018" stroke="#c3cbd6" strokeOpacity="0.19" />
      <path d="M26 20H242" stroke="#bbc4d0" strokeOpacity="0.12" />
      <path d="M37 12H49" stroke="#d1d7df" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      {[36, 56, 76, 96, 116].map((y, index) => (
        <g key={y} opacity={1 - index * 0.12}>
          <path d={`M39 ${y - 4}h5l2 2h6v7H39z`} fill="#b6beca" fillOpacity="0.25" />
          <path d={`M62 ${y - 1}h${[42, 32, 48, 37, 28][index]}M62 ${y + 4}h${[26, 44, 24, 30, 18][index]}`} stroke="#bac2cf" strokeOpacity="0.24" strokeLinecap="round" />
        </g>
      ))}
      <path d="M150 35V63C150 75 177 68 177 85V131" stroke="#b1becd" strokeOpacity="0.28" />
      <path d="M160 52V72C160 82 194 82 194 102V128" stroke="#a87873" strokeOpacity="0.35" />
      <path d="M160 53H150M177 111H194" stroke="#a8b5c5" strokeOpacity="0.18" />
      {[[150, 34], [160, 53], [177, 87], [177, 109], [194, 126]].map(([x, y], index) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.7" fill="#2b3036" stroke={index > 1 ? '#ad7e89' : '#b7c3d0'} strokeOpacity={0.46 - index * 0.05} />)}
      <path d="M163 35H187M173 53H207M189 87H215M204 126H221" stroke="#abb7c7" strokeOpacity="0.14" strokeLinecap="round" />
    </svg>
  );
}

function ProfileArtwork(): ReactElement {
  return (
    <svg viewBox="0 0 260 164" fill="none" aria-hidden="true" focusable="false">
      <rect x="23.5" y="5.5" width="222" height="145" rx="6" fill="#a9b4c2" fillOpacity="0.02" stroke="#bac5d3" strokeOpacity="0.19" />
      <circle cx="59" cy="40" r="20" stroke="#c2ccd9" strokeOpacity="0.4" />
      <text x="59" y="45" fill="#c5ceda" fillOpacity="0.54" fontSize="15" textAnchor="middle" fontFamily="Arial, sans-serif">LD</text>
      <path d="M91 29H133" stroke="#c7d0db" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
      <path d="M91 40H154M91 49H142M40 80H106M40 91H130M40 102H93" stroke="#b7c3d2" strokeOpacity="0.23" strokeLinecap="round" />
      <path d="M40 121h8l2 3h5v9H40z" fill="#b6c2d2" fillOpacity="0.17" />
      <path d="M63 124H100M63 131H91" stroke="#b7c3d2" strokeOpacity="0.15" strokeLinecap="round" />
      <path d="M177 43L209 86L155 72L175 118L209 86" stroke="#5590b3" strokeOpacity="0.32" />
      {[[177, 43], [155, 72], [209, 86], [175, 118]].map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="10.5" fill="#2b2e31" fillOpacity="0.8" stroke={index === 3 ? '#a87c78' : '#55849e'} strokeOpacity="0.32" />
          <circle cx={x} cy={y - 3} r="2.3" fill="#a3b6c9" fillOpacity="0.38" />
          <path d={`M${x - 4} ${y + 4}c0-5 8-5 8 0z`} fill="#a3b6c9" fillOpacity="0.3" />
        </g>
      ))}
    </svg>
  );
}

function EnvelopeArtwork(): ReactElement {
  return (
    <svg viewBox="0 0 240 164" fill="none" aria-hidden="true" focusable="false">
      <path d="M18 41H46M10 56H40M205 57H226M206 73H234M199 90H219" stroke="#aab6c7" strokeOpacity="0.09" strokeLinecap="round" />
      <path d="M65 58L130 17L198 58V139a5 5 0 0 1-5 5H70a5 5 0 0 1-5-5z" fill="#1c2229" fillOpacity="0.35" stroke="#adb8c8" strokeOpacity="0.2" />
      <g transform="rotate(4 129 65)">
        <rect x="87" y="8" width="100" height="117" rx="3" fill="#292c2e" stroke="#a2a3a5" strokeOpacity="0.3" />
        <path d="M100 24H127" stroke="#bcbebf" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
        <path d="M100 36H157M100 44H172M100 52H148M100 67H168M100 75H157M100 83H139" stroke="#b5b6b8" strokeOpacity="0.24" strokeLinecap="round" />
      </g>
      <path d="M65 58L127 104a7 7 0 0 0 8 0l63-46v81a5 5 0 0 1-5 5H70a5 5 0 0 1-5-5z" fill="#202428" stroke="#9b9ea2" strokeOpacity="0.19" />
      <path d="M65 58L127 104a7 7 0 0 0 8 0l63-46" stroke="#b7827e" strokeOpacity="0.78" />
      <path d="M67 140L111 101M196 140L151 102" stroke="#a1aebf" strokeOpacity="0.2" />
    </svg>
  );
}

function ResumeArtwork(): ReactElement {
  return (
    <svg viewBox="0 0 240 164" fill="none" aria-hidden="true" focusable="false">
      <g transform="rotate(8 167 83)">
        <rect x="128" y="22" width="75" height="128" rx="4" fill="#24272a" stroke="#a1a3a6" strokeOpacity="0.26" />
        <path d="M142 46H186M142 54H179M142 69H187M142 77H181M142 85H169" stroke="#afb0b3" strokeOpacity="0.18" strokeLinecap="round" />
      </g>
      <g transform="rotate(-6 122 82)">
        <rect x="68" y="7" width="104" height="148" rx="4" fill="#2b2d30" stroke="#a1a3a6" strokeOpacity="0.32" />
        <text x="81" y="28" fontSize="7.5" fontFamily="Arial, sans-serif" fill="#c5c6c8" fillOpacity="0.66">Leon Do</text>
        <path d="M81 40H154M81 47H144M81 54H151" stroke="#b4b5b8" strokeOpacity="0.38" strokeLinecap="round" />
        {[72, 100, 128].map((y) => (
          <g key={y}>
            <circle cx="82" cy={y} r="1.4" fill="#b78e89" fillOpacity="0.62" />
            <path d={`M89 ${y}h51M89 ${y + 7}h62M89 ${y + 13}h39`} stroke="#adb0b3" strokeOpacity="0.3" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  );
}

const ARTWORK: Record<ContactKind, () => ReactElement> = { github: RepositoryArtwork, linkedin: ProfileArtwork, email: EnvelopeArtwork, resume: ResumeArtwork };

export function ContactArtwork({ kind }: { kind: ContactKind }): ReactElement {
  const Artwork = ARTWORK[kind];
  return <Artwork />;
}
