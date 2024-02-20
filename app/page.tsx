'use client'
import leetCodeIcon from '../public/simple-icons_leetcode.svg'
import gitHubIcon from '../public/akar-icons_github-fill.svg'
import emailIcon from '../public/ic_outline-email.svg'
import linkedinIcon from '../public/mdi_linkedin.svg'
import { Interests } from '@/components/Interests'
import React, {useEffect, useState} from 'react'
import { Socials } from '@/components/Socials'

// export async function getServerSideProps() {
//   const res = await fetch('/api/spotify')
//   const data = await res.json()

//   return { props: {data}}
// }

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
    fetchCurrentSong();
  }, []);
  
  return (
  <main className='flex flex-col my-24 mx-[10%] md:mx-[20%] items-center justify-center'>
    <section id='introduction' className='pb-4 w-full'>
      <div className='flex flex-col justify-between md:flex-row'>
        <div className='text-2xl xl:text-3xl 2xl:text-4xl font-heebo'>Leon Do</div>
        <div className='text-sm md:text-base xl:text-lg 2xl:text-xl text-viral pt-1 md:pt-3 font-light font-gothic'>・Currently listening to {currentSong.title} - {currentSong.artist}</div>
      </div>
      <div className='pt-4 pb-12'>
        <div className='md:text-lg xl:text-xl 2xl:text-2xl font-thin'>19 years old aspiring software engineer pursuing CS with a minor in Pure Mathematics at California State University of Long Beach. Driven by curiosity and passion, I am always eager to learn and create.</div>
      </div>
      <div className='flex flex-row flex-wrap w-full justify-start items-start mb-[72px]'>
        <Socials icon={gitHubIcon} link='https://github.com/yushasama' text='yushasama' color='fuschia'/>
        {/* <Socials icon={leetCodeIcon} link='https://leetcode.com/heretik' text='heretik' color='orange'/> */}
        <Socials icon={linkedinIcon} link='https://www.linkedin.com/in/leon-do-682003156/' text='Leon Do' color='blue'/>
        <Socials icon={emailIcon} link='/' text='leontdo2004@gmail.com' color='teal'/>
      </div>
    </section>
    <section id='interests' className='flex flex-col justify-start items-start w-full mb-[72px]'>
      <div className='text-2xl xl:text-3xl 2xl:text-4xl font-heebo'>Recent Interests</div>
      <div className='flex flex-row flex-wrap'>
        {/* <Interests text='Real Analysis'/> */}
        {/* <Interests text='Leetcode'/> */}
        {/* <Interests text='Trading'/> */}
        <Interests text='German Automobiles'/>
        {/* <Interests text='Filipino Cuisine'/> */}
        {/* <Interests text='Data Structures'/> */}
        {/* <Interests text='Bayesian Statistics'/> */}
        <Interests text='Liquidity Provision'/>
        <Interests text='Korean BBQ'/>
        <Interests text='NeoVim'/>
        <Interests text='NextJS'/>
        <Interests text='Python'/>
        <Interests text='Golang'/>
        <Interests text='Release Hallucination'/>
        <Interests text='Elfensjon'/>
      </div>
    </section>
    <section id='experience' className='flex flex-col justify-start w-full mb-[72px]'>
      <div className='text-2xl xl:text-3xl 2xl:text-4xl pb-4 font-heebo'>Experience</div>
      <div className='text-base md:text-xl 2xl:text-2xl pb-2'>
        <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-2'>
          <div>Infiniti Trading・Web Developer</div>
          <div>9/2022 - 11/2022</div>
        </div>
        <div className='font-thin text-xs md:text-sm'>
          <div>Designed and prototyped the Infiniti Trading website using Figma, ensuring a user-friendly interface and seamless user experience. Developed and launched <a href='https://infiniti-site-9xmirage.vercel.app/' className='text-blue-400'>https://infinititrading.io/</a> {'retired'} using NextJS. Incorporated TailwindCSS to implement responsive and modern styling, enhancing the website{"'"}s visual appeal across multiple devices.</div>
        </div>
      </div>
    </section>
    <section id='projects' className='flex flex-col justify-start w-full'>
      <div className='text-2xl xl:text-3xl 2xl:text-4xl pb-4 font-heebo'>Projects & Ventures</div>
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-4'>
            <div>Rias Software・Founder, SWE</div>
            <div>8/2021 - 6/2022</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Crafted alternative investment strategies in Retail and Cryptocurrency and executed them through software, generating $30,000 in 2021-2022. Developed applications for automated interactions with Ethereum and Terra Luna blockchains, streamlining processes. Enhanced data acquisition through reverse-engineering of APIs, site flows, and advanced data scraping via HTML requests.</div>
          </div>
      </div>
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-4'>
            <div>Desktop Application for Sorting Manga Work</div>
            <div>6/2023 - 6/2023</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Developed a custom user interface that seamlessly integrated the scraped data into a raindrop.io database, allowing for efficient categorization and management of manga works. Automated data extraction of manga title, description, genres, and covers from websites for comprehensive collection. Created a Windows application using ElectronJS, JavaScript, HTML, and CSS to automate the categorization of manga works. Integrated scraped data seamlessly into the database via a custom-built user interface.</div>
          </div>
      </div>
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-4'>
            <div>Chipotle Rewards Claimer</div>
            <div>11/2022 - 12/2022</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Created a system in JavaScript to automatically find and redeem free Chipotle Entree codes via SMS. Continuously scanned for free Chipotle codes from various sources. Used a VOIP service and CLI to send mass SMS messages to Chipotle{"'"}s number, 888222. Sent collected codes to Chipotle{"'"}s number for successful redemption. Achieved automated and reliable free Chipotle Entree code redemption.</div>
          </div>
      </div>
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-4'>
            <div>Vanity Ethereum Address Generator</div>
            <div>5/2022 - 6/2022</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Developed a Javascript application that allows users to specify a custom prefix for their Ethereum {'(ETH)'} wallet address. The application generates wallet addresses iteratively until a matching address with the user{"'"}s specified prefix is found. Provided users with the ability to obtain ETH wallet addresses that align with their chosen prefix, enhancing the personalization and usability of their cryptocurrency wallets.</div>
          </div>
      </div>
      <div className='md:text-xl 2xl:text-2xl pb-10'>
          <div className='flex flex-col md:flex-row font-thin w-full justify-between pb-4'>
            <div>Golang Malware Development</div>
            <div>12/2023 - 1/2024</div>
          </div>
          <div className='font-thin text-xs md:text-sm'>
            <div>Developed functional malware in Golang, a language with no prior experience in. Showcasing rapid self-learning and programming proficiency.Remodified and improved an open-source project, highlighting adaptability and collaborative coding skills.</div>
          </div>
          <div className='md:text-xl 2xl:text-2xl pb-10'>
      </div>
      </div>
    </section>
    <footer className='mt-20 flex flex-col w-full justify-center items-center font-thin'>
      <div>koishiteru・恋してる</div>
      <div>falling in love {'<'}3</div>
    </footer>
 </main>
  )
}