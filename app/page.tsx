'use client'
import gitHubIcon from '../public/akar-icons_github-fill.svg'
import emailIcon from '../public/ic_outline-email.svg'
import foodIcon from '../public/material-symbols-light_ramen-dining-outline-rounded.svg'
import saikouIcon from '../public/solar_heart-broken.svg'
import studyIcon from '../public/ph_books-light.svg'
import musicIcon from '../public/mingcute_music-3-line.svg'
import linkedinIcon from '../public/mdi_linkedin.svg'
import { Interests } from '@/components/Interests'
import React, {useEffect, useState} from 'react'
import { Socials } from '@/components/Socials'
import { Experiences } from '@/components/Experience'

export default function Home() {
  const [currentSong, setCurrentSong] = useState({ title: '', artist: '' });

  const fetchCurrentSong = async () => {
    try {
      const res = await fetch('/api/spotify');
      if (res.ok) {
        const data = await res.json();
        setCurrentSong(data);

        console.log(data)
        console.log(currentSong)

      } else {
        console.error('Failed to fetch current song');
      }
    } catch (error) {
      console.error('Error fetching current song', error);
    }
  };

  useEffect(() => {
    fetchCurrentSong()
    const interval = setInterval(() => fetchCurrentSong(), 5000);
    return () => {
      clearInterval(interval)
    }
  }, []);

  const interestsData = [
    { icon: saikouIcon, text: 'German Automobiles' },
    { icon: saikouIcon, text: 'Korean BBQ' },
    { icon: saikouIcon, text: 'Computational Finance' },
    { icon: studyIcon, text: 'Python, Typescript, Golang' },
    { icon: studyIcon, text: 'Machine Learning' },
    { icon: saikouIcon, text: 'Release Hallucination' },
    { icon: saikouIcon, text: 'Elfensjon' },
    { icon: foodIcon, text: 'Takoyaki' },
    { icon: saikouIcon, text: 'Curry Udon' },
    { icon: musicIcon, text: 'JRock, JMetal, JPop' },
    { icon: musicIcon, text: 'Hardcore, Hardstyle, Frenchcore' },
    { icon: studyIcon, text: 'Digital Signal Processing' },
    { icon: studyIcon, text: 'Fourier Analysis' },
  ];

  const sortedInterests = interestsData.sort((a, b) => {
    if (a.icon === saikouIcon && b.icon !== saikouIcon) return -1;
    if (a.icon !== saikouIcon && b.icon === saikouIcon) return 1;
    return 0;
  });

  return (
  <main className='flex flex-col my-24 mx-[10%] md:mx-[20%] items-center justify-center'>
    <section id='introduction' className='pb-4 w-full'>
      <div className='flex flex-col justify-between md:flex-row'>
        <div className='text-2xl xl:text-3xl 2xl:text-4xl font-heebo'>Leon Do</div>
            {currentSong &&
              <div className='text-sm md:text-base xl:text-lg 2xl:text-xl text-viral pt-1 md:pt-3 font-light font-gothic'>・Currently listening to {currentSong.title} - {currentSong.artist}</div>
            }

            {!currentSong &&
              <div className='text-sm md:text-base xl:text-lg 2xl:text-xl text-rias pt-1 md:pt-3 font-light font-gothic'>・No songs playing at the moment</div>
            }
      </div>
      <div className='pt-4 pb-12'>
        <div className='md:text-lg xl:text-xl 2xl:text-2xl font-thin'>20 years old aspiring software engineer pursuing CS with a minor in Pure Mathematics at California State University of Long Beach. Driven by curiosity and passion, I am always eager to learn and create.</div>
      </div>
      <div className='flex flex-row flex-wrap w-full justify-start items-start mb-[72px]'>
        <Socials icon={gitHubIcon} link='https://github.com/yushasama' text='yushasama' color='fuschia'/>
        <Socials icon={linkedinIcon} link='https://www.linkedin.com/in/leon-do-682003156/' text='Leon Do' color='blue'/>
        <Socials icon={emailIcon} link='/' text='leontdo2004@gmail.com' color='teal'/>
      </div>
    </section>
    <section id='interests' className='flex flex-col justify-start items-start w-full mb-[72px]'>
      <div className='text-2xl xl:text-3xl 2xl:text-4xl font-heebo'>Recent Interests</div>
      <div className='flex flex-row flex-wrap'>
        {sortedInterests.map((interest, index) => (
            <Interests key={index} icon={interest.icon} text={interest.text} />
        ))}
      </div>
    </section>
    <section id='experiences' className='flex flex-col justify-start w-full mb-[72px]'>
      <div className='text-2xl xl:text-3xl 2xl:text-4xl pb-4 font-heebo'>Experience</div>
      <Experiences
      companyName='Beach Investment Group'
      role='Quantitative Developer Intern'
      startDate='6/2024'
      endDate='PRESENT'
      details={
          <>
          Developed a comprehensive toolkit for quantitative analysis aimed at the Beach Investment Group.
          Implemented tools for risk metric computations and automated retrieval of market data.
          Reduced manual data retrieval and analysis times by over 90%.
          Simplified mathematical formulas into matrix transformations, leveraging NumPy and Pandas for efficient linear algebra computations.
          Applied machine learning concepts such as PCA, Kernel PCA, Ridge Regression for forecasting risk and returns of securities.
          </>
        }
      />
      <Experiences
      companyName='Beach Investment Group'
      role='Research Intern'
      startDate='6/2023'
      endDate='8/2023'
      details={
          <>
          Utilized Excel for advanced data visualization, creating detailed graphs to aid in the analysis of market trends and investment opportunities.
          Identified key macroeconomic factors and conducted comprehensive research to understand their impact on financial markets and interrelations with other economic indicators.
          Assessed and synthesized findings to predict market movements and economic conditions over a 6-12 month period.
          Collaborated within a team environment to discuss research outcomes and investment strategy formulation process.
          </>
        }
      />
      <Experiences
      companyName='Infiniti Trading'
      role='Web Developer'
      startDate='9/2022'
      endDate='11/2022'
      details={
          <>
          Designed and prototyped the Infiniti Trading website using Figma, ensuring a user-friendly interface and seamless user experience. Developed and launched <a href='https://infiniti-site-9xmirage.vercel.app/' className='text-blue-400'>https://infinititrading.io/</a> {'(original link no longer active as business is now longer defunct)'} using NextJS. Incorporated TailwindCSS to implement responsive and modern styling, enhancing the website{"'"}s visual appeal across multiple devices.
          </>
        }
      />
    </section>
    <section id='projects' className='flex flex-col justify-start w-full'>
      <div className='text-2xl xl:text-3xl 2xl:text-4xl pb-4 font-heebo'>Projects & Ventures</div>
      <Experiences 
        companyName='Mirai Research' 
        role='Founder & Lead Software Engineer' 
        startDate='5/2024' 
        endDate='7/2024'
        details={
          <>
          Directed a team of developers, voicing project goals and timelines to ensure project alignment and efficiency. Spearheaded the development roadmap and process for a desktop application designed to implement semi to fully automated Cryptocurrency trading and enhance trading capabilities. 
          Designed internal libraries and classes to interact seamlessly with cryptocurrency protocols, increasing development speed and reducing complexities. 
          Benchmarked the software’s latency in executing trades and identifying potentially profitable opportunities. 
          Deployed a Command Line Interface for the software, creating a pleasant user experience.
          </>
        }
      />
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-2'>
            <div>Rias Software・Founder, Software Engineer</div>
            <div>8/2021 - 6/2022</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Crafted investment strategies based on non traditional security markets such as Cryptocurrency and Non Fungible Tokens. Accrument of these securities were executed through the assistance of software both partially and entirely. Software assisted investment strategies made $20,000 profit with a $30,000 revenue in 2021-2022. Developed a Javascript application for automated interactions with Ethereum & Terra Luna’s blockchain network, saving time spent on manual actions by 90%. Reverse-engineered rest APIs, site flows, and engineered a system for scraping and processing thousands of lines of data.</div>
          </div>
      </div>
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-2'>
            <div>Desktop Application for Sorting Manga Work</div>
            <div>6/2023 - 6/2023</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Developed a custom application that seamlessly integrated the scraped data into a raindrop.io database, allowing for efficient categorization and management of manga works. Automated data extraction of manga title, description, genres, and covers from websites for comprehensive collection. Optimizing operation time by an estimated 97% Created a custom Windows application using ElectronJS, JavaScript, HTML, and CSS to automate the categorization of manga works. Integrated scraped data seamlessly into the database via a custom application.</div>
          </div>
      </div>
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-2'>
            <div>Chipotle Rewards Claimer</div>
            <div>11/2022 - 12/2022</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Created an application in JavaScript to automatically find and redeem free Chipotle Entree codes via SMS. Continuously scanned for free Chipotle codes from various websites or platforms using their APIs. Sent and redeemed 100s of collected codes to Chipotle through a VOIP service for successful redemption. Accumulated 4 figures worth of chipotle codes, turning them into profit.</div>
          </div>
      </div>
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-2'>
            <div>Vanity Ethereum Address Generator</div>
            <div>5/2022 - 6/2022</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Developed a Javascript application that allows users to specify a custom prefix for their Ethereum {'(ETH)'} wallet address. The application generates wallet addresses iteratively until a matching address with the user{"'"}s specified prefix is found. Provided users with the ability to obtain ETH wallet addresses that align with their chosen prefix, enhancing the personalization and usability of their cryptocurrency wallets.</div>
          </div>
      </div>
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-2'>
            <div>Golang Malware Development</div>
            <div>12/2023 - 1/2024</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Developed functional malware as a starter project to learn Golang and system security. Used an open source project and fine tuned it to personal preferences. </div>
          </div>
          <div className='md:text-xl 2xl:text-2xl pb-10'>
      </div>
      </div>
    </section>
    <footer className='mt-20 flex flex-col w-full justify-center items-center font-thin'>
      <div className='group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-rias group-hover:to-yellow-200 transition duration-300 ease-in-out'>koishiteru・恋してる</div>
      <div>falling in love {'<'}3</div>
    </footer>
 </main>
  )
}