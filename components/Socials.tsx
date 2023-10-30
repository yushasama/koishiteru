import Image from 'next/image';
import React from 'react';

interface SocialsProp {
  icon: string;
  link: string;
  text: string;
  color: string; // Change type to string
}

export const Socials: React.FC<SocialsProp> = ({ icon, link, text, color }) => {
  const colorClass = `text-${color}`; // Create a class name based on the color prop

  return (
    <a
      href={link}
      className={`mr-2 w-min px-6 py-2 h-min border-${color} border rounded-md flex flex-row justify-center items-center space-x-2 whitespace-nowrap text-xs md:text-sm 2xl:text-base transition ease-in-out delay-150 hover:-translate-y-0.5 hover:scale-105`}
    >
      <Image src={icon} alt="icon" />
      <div className={colorClass}>{text}</div>
    </a>
  );
};
