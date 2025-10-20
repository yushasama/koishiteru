import React from "react";

interface Book {
  title: string;
  author: string;
}

interface ReadingSectionProps {
  sectionTitle: string;
  books: Book[];
}

export default function ReadingSection({ sectionTitle, books }: ReadingSectionProps) {
  return (
    <section className="mb-14">
      <h2 className="relative mb-6 inline-block text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
        {sectionTitle}
        <span className="absolute bottom-[-4px] left-0 h-[1px] w-full bg-gradient-to-r from-violet-500/70 to-transparent"></span>
      </h2>

      <ul>
        {books.map((book, i) => (
          <li
            key={i}
            className="group cursor-pointer px-2 py-4 sm:py-5 pl-3 transition-colors duration-200 hover:bg-white/[0.02] border-l-2 border-transparent hover:border-violet-500/70 border-t border-white/5"
          >
            <div className="text-[1rem] sm:text-[1.05rem] font-medium text-gray-100 group-hover:text-violet-300">
              {book.title}
            </div>
            <div className="text-sm italic text-gray-500">{book.author}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
