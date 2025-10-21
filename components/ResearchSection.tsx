import React from "react";

interface ResearchItem {
  title: string;
  subtitle: string;
}

interface ResearchSectionProps {
  items: ResearchItem[];
}

export default function ResearchSection({ items }: ResearchSectionProps) {
  return (
    <section className="mb-16 rounded-xl border border-violet-300/10 bg-white/[0.015] p-5 sm:p-6 lg:p-8">
      <h2 className="text-base sm:text-lg font-semibold text-violet-300 mb-5">
        Research
      </h2>
      <ul className="space-y-6">
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
            <div className="text-sm italic text-gray-500 leading-snug">
              {item.subtitle}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
