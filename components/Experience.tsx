import React from 'react';

interface ExperienceProps {
  companyName: string;
  role?: string;
  startDate: string;
  endDate: string;
  details: string | React.ReactNode;
}

export const Experiences: React.FC<ExperienceProps> = ({companyName, role, startDate, endDate, details}) => {
  return(
    <div className='text-base md:text-xl 2xl:text-2xl pb-10'>
    <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-2'>
      {role &&
        <div>{`${companyName}・${role}`}</div>
      }
      {!role &&
        <div>{`${companyName}`}</div>
      }
      <div>{`${startDate} - ${endDate}`}</div>
    </div>
    <div className='font-thin text-xs md:text-sm'>
      <div>{details}</div>
    </div>
  </div>
  )

}