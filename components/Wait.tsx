import React from 'react';


export const WaitingScreen = () => {
  return(
    <div className='flex items-center justify-center'>
      <div className="flex h-40 w-full flex-row items-center justify-center">
      <button className="inline-block outline-1 rounded-md bg-white bg-gradient-to-r from-pink-500 to-blue-500 bg-[length:400%_400%] p-0.5">
        <span className="block rounded-md bg-slate-900 px-5 py-3 font-bold text-white"> Coming soon, please wait! </span>
      </button>
    </div>
    </div>
  )
}