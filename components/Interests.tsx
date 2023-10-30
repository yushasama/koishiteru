import React from 'react';

interface InterestsProps {
  text: string;
}

export const Interests: React.FC<InterestsProps> = ({text}) => {
  return(
  <div className='pt-4 mr-4'>
    <div className='w-min px-6 py-2 h-min border-stone0 border rounded-md flex flex-row justify-center items-center whitespace-nowrap hover:bg-gradient-to-r from-pink-500 to-rose-700 hover:text-white hover:border-rose-400 transition ease-in-out delay-150 hover:-translate-y-0.5 hover:scale-105'>
      <div className='text-stone-300 '>{text}</div>
    </div>
  </div>
  )
}