import Image from 'next/image';
import React from 'react';

interface SocialsProp {
  icon: string;
  link: string;
  text: string;
  color: 'fuschia' | 'orange' | 'blue' | 'teal'; 
}

// interface ColorsVariantsObj {
//   [color: string]: string
// }

export const Socials: React.FC<SocialsProp> = ({ icon, link, text, color }) => {
  const colorVariant = {
    'fuschia': 'text-fuschia border-fuschia',
    'orange': 'text-orange-300 border-orange-300',
    'blue': 'text-blue-300 border-blue-300',
    'teal': 'text-teal-200 border-teal-200'
  }

  return (
    <div className='pt-2 mr-2'>
      <a href={link} className={`mr-2 px-3 py-2 h-9 md:h-10 border-${colorVariant[color]} border rounded-md flex flex-row justify-center items-center space-x-2 whitespace-nowrap text-xs md:text-sm 2xl:text-base transition ease-in-out delay-150 hover:-translate-y-0.5 hover:scale-105`}>
        <Image src={icon} alt="icon" />
        <div className='hi'>{text}</div>
      </a>
    </div>
  );
};
