import Image, { StaticImageData } from 'next/image';
import React from 'react';

interface InterestProps {
  icon?: string | StaticImageData;
  text: string;
}

export const Interests: React.FC<InterestProps> = ({icon='', text}) => {
  const iconSrc = typeof icon === 'object' ? icon.src : icon;

  const isHeartIcon = iconSrc.includes('saikou_icon');

    console.log(icon, typeof icon)
    const borderGradient = isHeartIcon
    ? 'from-pink-500 to-rose-700 hover:border-rose-400'
    : 'from-sky-500 to-blue-700 hover:border-blue-400'

    return(
  <div className='pt-4 mr-4'>  
    <div className={`w-min px-6 py-2 h-min border-white border rounded-md flex flex-row justify-center items-center whitespace-nowrap hover:bg-gradient-to-r ${borderGradient} transition ease-in-out delay-150 hover:-translate-y-0.5 hover:scale-105`}>
      {icon && 
        <Image className='transform scale-125 mr-2' src={icon} alt="icon" />
      }
      <div className='text-xs md:text-sm 2xl:text-base text-stone-300 hover:text-white'>{text}</div>
    </div>
  </div>
  )
}