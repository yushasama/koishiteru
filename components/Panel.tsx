import Link from "next/link";
import React from "react";

interface PanelProps {
  image: string;
  title: string;
  subtitle: string;
  delay?: number;
  href?: string;
}

const Panel: React.FC<PanelProps> = ({
  image,
  title,
  subtitle,
  delay = 0,
  href,
}) => {
  const content = (
    <div
      className="
        group relative flex-shrink-0
        w-[20vw] h-screen
        overflow-hidden
        bg-[#0f0f0f]
        cursor-pointer
      "
    >
      {/* --- IMAGE CONTAINER --- */}
      <div
        className="
          relative h-[90%] w-[90%] mx-auto mt-[5%]
          overflow-hidden
          rounded-sm
        "
      >
        <img
          src={image}
          alt={title}
          className="
            h-full w-full object-cover
            grayscale-[0.85] brightness-[0.9]
            transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
            group-hover:grayscale-0 group-hover:brightness-100 group-hover:-translate-y-[20px]
          "
        />
        {/* continuous shine */}
        <div
          className="panel-shine pointer-events-none"
          style={{ animationDelay: `${delay}s` }}
        />
      </div>

      {/* --- BOTTOM OVERLAY --- */}
      <div
        className="
          absolute bottom-0 left-0 w-full
          bg-[#0f0f0f] text-white
          h-[45%]
          translate-y-[100%] group-hover:translate-y-[60%]
          transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)]
        "
      >
        <div className="p-6">
          <h2 className="text-xl font-bold uppercase">{title}</h2>
          <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full w-full">
      {content}
    </Link>
  ) : (
    content
  );
};

export default Panel;