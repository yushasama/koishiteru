'use client'
import gitHubIcon from '../public/github_icon.svg'
import emailIcon from '../public/email_icon.svg'
import foodIcon from '../public/food_icon.svg'
import saikouIcon from '../public/saikou_icon.svg'
import studyIcon from '../public/study_icon.svg'
import musicIcon from '../public/music_icon.svg'
import linkedinIcon from '../public/linkedin_icon.svg'
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
    { icon: foodIcon, text: 'Takoyaki, Sushi, Katsu' },
    { icon: saikouIcon, text: 'Curry Udon' },
    { icon: musicIcon, text: 'JRock, JMetal, JPop' },
    { icon: foodIcon, text: 'BBQing (Smoking)' },
    { icon: musicIcon, text: 'Hardcore, Hardstyle, Frenchcore' },
    { icon: studyIcon, text: 'Digital Signal Processing' },
    { icon: studyIcon, text: 'Fourier Analysis' },
  ];

  const sortedInterests = interestsData.sort((a, b) => {
    if (a.icon === saikouIcon && b.icon !== saikouIcon) return -1;
    if (a.icon !== saikouIcon && b.icon === saikouIcon) return 1;
    return 0;
  });

  const calculateYearsSinceDate = (date: string) => {
    // Note that date should follow the format MM/DD/YYYY
    const startDate = new Date(date);
    const today = new Date();

    let years = today.getFullYear() - startDate.getFullYear();
    const monthDifference = today.getMonth() - startDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < startDate.getDate())) {
      years--;
    }

    return years;
  };

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
        <div className='md:text-lg xl:text-xl 2xl:text-2xl font-thin'>I am currently a {calculateYearsSinceDate("03/07/2004")} years old apiring software engineer.
          My university of attendance is the California State University of Long Beach.
          I am studying as a Computer Science major, along with a minor in Pure Mathematics.
          I have been programming for around {calculateYearsSinceDate("02/28/2021")} years since my  junior year of high school. 
          While working on my first major program, Rias Software, I realized that programming is what I wanted to do. 
          I love the aspect of constant problem solving, designing systems, and watching my ideas manifest into reality.
          Driven by my curiosity and passion, I am always eager to learn and create.
        </div>
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
      companyName='Rust-Based Financial Data Aggregator'        
      role=''
      startDate='7/2024'
      endDate='7/2024'
      details={
        <>
        Collected and aggregated financial data through the web scraping of various financial websites.
        Programmed asynchronously to handle I/O-bound tasks efficiently, opening up the potential for concurrency in future enhancements, thus improving the tool’s scalability and responsiveness.
        Engineered a robust data processing pipeline to clean and structure data efficiently, reducing data processing time by 30%.
        Optimized code structure with modular design and object-oriented principles, improving code maintainability and scalability, which facilitated easy updates and extensions to the tool.
        Utilized text processing algorithms, increasing accuracy of aggregated data.
        </>
      }
      />
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
      <Experiences
      companyName='Rias Software'
      role='Founder, Software Engineer'
      startDate='8/2021'
      endDate='6/2022'
      details={
        <>
        Crafted investment strategies based on non traditional security markets such as Cryptocurrency and Non Fungible Tokens.
        Accrument of these securities were executed through the assistance of software both partially and entirely.
        Software assisted investment strategies made $20,000 profit with a $30,000 revenue in 2021-2022.
        Developed a Javascript application for automated interactions with Ethereum & Terra Luna’s blockchain network, saving time spent on manual actions by 90%.
        Reverse-engineered rest APIs, site flows, and engineered a system for scraping and processing thousands of lines of data.
        </>
      }
      />
      <Experiences
      companyName='Desktop Application for Sorting Manga Work'
      startDate='6/2023'
      endDate='6/2023'
      details={
        <>
        Developed a custom application that seamlessly integrated the scraped data into a raindrop.io database, allowing for efficient categorization and management of manga works.
        Automated data extraction of manga title, description, genres, and covers from websites for comprehensive collection.
        Optimizing operation time by an estimated 97% Created a custom Windows application using ElectronJS, JavaScript, HTML, and CSS to automate the categorization of manga works.
        Integrated scraped data seamlessly into the database via a custom application.
        </>
      }
      />
      <Experiences
      companyName='Chipotle Rewards Bot'
      startDate='11/2022'
      endDate='12/2022'
      details='Created an application in JavaScript to automatically find and redeem free Chipotle Entree codes via SMS. Continuously scanned for free Chipotle codes from various websites or platforms using their APIs. Sent and redeemed 100s of collected codes to Chipotle through a VOIP service for successful redemption. Accumulated 4 figures worth of chipotle codes, turning them into profit.'
      />
      <Experiences
      companyName='Ethereum Vanity Address Generator'
      startDate='5/2022'
      endDate='6/2022'
      details={
        <>
        Developed a Javascript application that allows users to specify a custom prefix for their Ethereum wallet address. The application generates wallet addresses iteratively until a matching address with the user{"'"}s specified prefix is found.
        Provided users with the ability to obtain ETH wallet addresses that align with their chosen prefix, enhancing the personalization and usability of their cryptocurrency wallets.
        </>
      }
      />
    </section>
    <footer className='mt-20 flex flex-col w-full justify-center items-center font-thin'>
      <div>koishiteru・恋してる</div>
      <div>falling in love {'<'}3</div>
    </footer>
 </main>
  )
}