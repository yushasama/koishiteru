import React from "react";

interface ResearchItem {
  title: string;
  subtitle: string;
}

interface ResearchSectionProps {
  items: ResearchItem[];
}

export default function ResearchSection({ items }: ResearchSectionProps): React.JSX.Element {
  return (
    <section aria-labelledby="exploring-heading" className="space-y-8">
      <h2 id="exploring-heading" className="text-2xl font-medium text-gray-100">
        Exploring
      </h2>
      <ul className="space-y-6 rounded-xl border border-violet-200/15 bg-black/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:p-6 lg:p-8">
        {items.map((item, i) => (
          <li
            key={i}
            className="relative pl-6 text-gray-300 leading-relaxed sm:text-[0.95rem]"
          >
            <span className="absolute left-0 top-1 text-violet-400 font-bold">
              →
            </span>
            <div className="text-base sm:text-lg font-medium text-gray-100 mb-1">
              {item.title}
            </div>
            <div className="text-sm italic text-gray-300 leading-snug">
              {item.subtitle}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
