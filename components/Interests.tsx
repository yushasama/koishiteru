import React from 'react';

interface InterestsProps {
  text: string;
}

export const Interests: React.FC<InterestsProps> = ({text}) => {
  return(
  <div className='pt-4 mr-4'>
    <div className='w-min px-6 py-2 h-min border-white border rounded-md flex flex-row justify-center items-center whitespace-nowrap hover:bg-gradient-to-r from-pink-500 to-rose-700 hover:border-rose-400 transition ease-in-out delay-150 hover:-translate-y-0.5 hover:scale-105'>
      <div className='text-xs md:text-sm 2xl:text-base text-stone-300 hover:text-white'>{text}</div>
    </div>
  </div>
  )
}