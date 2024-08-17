import Image from 'next/image';
import React from 'react';

interface InterestProps {
  icon?: string;
  text: string;
}

export const Interests: React.FC<InterestProps> = ({icon='', text}) => {
    const isHeartIcon = icon.src == '/_next/static/media/solar_heart-broken.73022f8f.svg'
    console.log(typeof icon.src)

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