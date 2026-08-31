import React from 'react';

interface ExperienceProps {
  companyName: string | React.ReactNode;
  role?: string;
  startDate?: string;
  endDate?: string;
  details: string | React.ReactNode;
}

export const Experiences: React.FC<ExperienceProps> = ({companyName, role, startDate, endDate, details}) => {
  return(
    <div className='text-base md:text-xl 2xl:text-2xl pb-10'>
    <div className='flex flex-col md:flex-row font-normal w-full justify-between pb-2'>
      {role &&
        <div>{companyName}・{role}</div>
      }
      {!role &&
        <div>{companyName}</div>
      }
      {(startDate || endDate) && <div>{[startDate, endDate].filter(Boolean).join(' - ')}</div>}
    </div>
    <div className='font-light text-xs md:text-sm'>
      <div>{details}</div>
    </div>
  </div>
  )

}
