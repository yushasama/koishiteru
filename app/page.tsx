import leetcodeIcon from '../public/simple-icons_leetcode.svg'
import gitHubIcon from '../public/akar-icons_github-fill.svg'
import linkedinIcon from '../public/mdi_linkedin.svg'
import emailIcon from '../public/ic_outline-email.svg'
import { Interests } from '@/components/Interests'
import Image from 'next/image'
import useSWR  from 'swr'

export default function Home() {
  return (
  <main className='flex flex-col my-24 mx-[420px] items-center justify-center'>
    <section id='introduction'>
      <div className='flex flex-row w-full justify-between'>
        <div className='text-4xl font-heebo'>Leon Do</div>
        <div className='flex text-right text-xl text-viral pt-3'>・Currently listening to WEBSITE IS WIP - Leon Do</div>
      </div>
      <div className='pt-4 pb-12'>
        <div className='text-2xl font-thin'>19y/o aspiring software engineer pursuing CS with a minor in Pure Mathematics at California State University of Long Beach. Driven by curiosity and passion, I am always eager to learn and create.</div>
      </div>
      <div className='flex flex-row space-x-8 w-full justify-start items-start mb-[72px]'>
        <a href='https://github.com/yushasama' className='w-min px-6 py-2 h-min border-fuschia border rounded-md flex flex-row justify-center items-center space-x-2'>
          <Image src={gitHubIcon} alt='github icon'/>
          <div className='text-fuchsia-50'>yushasama</div>
        </a>
        <a href='https://leetcode.com/heretik' className='w-min px-6 py-2 h-min border-orange-300 border rounded-md flex flex-row justify-center items-center space-x-2'>
          <Image src={leetcodeIcon} alt='leetcode icon'/>
          <div className='text-orange-300'>heretik</div>
        </a>
        <a href='https://www.linkedin.com/in/leon-do-682003156/' className='w-min px-6 py-2 h-min border-blue-300 border rounded-md flex flex-row justify-center items-center space-x-2 whitespace-nowrap'>
          <Image src={linkedinIcon} alt='linkedin icon'/>
          <div className='text-blue-300'>Leon Do</div>
        </a>
        <a href='/#' className='w-min px-6 py-2 h-min border-teal-200  border rounded-md flex flex-row justify-center items-center space-x-2'>
          <Image src={emailIcon} alt='email icon'/>
          <div className='text-teal-200 '>leon.do@koishite.ru</div>
        </a>
      </div>
    </section>
    <section id='interests' className='flex flex-col justify-start items-start w-full mb-[72px] font-heebo'>
      <div className='text-4xl'>Recent Interests</div>
      <div className='flex flex-row flex-wrap'>
        <Interests text='Real Analysis'/>
        <Interests text='Leetcode'/>
        <Interests text='Trading'/>
        <Interests text='German Automobiles'/>
        <Interests text='Filipino Cuisine'/>
        <Interests text='Data Structures'/>
        <Interests text='Bayesian Statistics'/>
        <Interests text='NextJS'/>
        <Interests text='Python'/>
        <Interests text='Elfensjon'/>
        <Interests text='Release Hallucination'/>
      </div>
    </section>
    <section id='experience' className='flex flex-col justify-start w-full mb-[72px]'>
      <div className='text-4xl pb-4 font-heebo'>Experience</div>
      <div className='text-2xl pb-2'>
        <div className=' flex flex-row text-2xl font-thin w-full justify-between pb-2'>
          <div>Infiniti Trading・Web Developer</div>
          <div>9/2022 - 11/22</div>
        </div>
        <div className='font-thin text-sm'>
          <div>Designed and prototyped the Infiniti Trading website using Figma, ensuring a user-friendly interface and seamless user experience. Developed and launched <a href='https://infiniti-site-9xmirage.vercel.app/' className='text-blue-400'>https://infinititrading.io/</a> {'retired'} using NextJS. Incorporated TailwindCSS to implement responsive and modern styling, enhancing the website{"'"}s visual appeal across multiple devices.</div>
        </div>
      </div>
    </section>
    <section id='projects' className='flex flex-col justify-start w-full'>
      <div className='text-4xl pb-4 font-heebo'>Projects & Ventures</div>
      <div className='text-2xl pb-10'>
          <div className=' flex flex-row text-2xl font-thin w-full justify-between pb-4'>
            <div>Rias Software・Founder, SWE</div>
            <div>8/2021 - 6/2022</div>
          </div>
          <div className='font-thin text-sm'>
            <div>Crafted alternative investment strategies in Retail and Cryptocurrency and executed them through software, generating $30,000 in 2021-2022. Developed applications for automated interactions with Ethereum and Terra Luna blockchains, streamlining processes. Enhanced data acquisition through reverse-engineering of APIs, site flows, and advanced data scraping via HTML requests.</div>
          </div>
      </div>
      <div className='text-2xl pb-10'>
          <div className=' flex flex-row text-2xl font-thin w-full justify-between pb-4'>
            <div>Desktop Application for Sorting Manga Work</div>
            <div>6/2023 - 6/2023</div>
          </div>
          <div className='font-thin text-sm'>
            <div>Developed a custom user interface that seamlessly integrated the scraped data into a raindrop.io database, allowing for efficient categorization and management of manga works. Automated data extraction of manga title, description, genres, and covers from websites for comprehensive collection. Created a Windows application using ElectronJS, JavaScript, HTML, and CSS to automate the categorization of manga works. Integrated scraped data seamlessly into the database via a custom-built user interface.</div>
          </div>
      </div>
      <div className='text-2xl pb-10'>
          <div className=' flex flex-row text-2xl font-thin w-full justify-between pb-4'>
            <div>Chipotle Rewards Claimer</div>
            <div>11/2022 - 12/2022</div>
          </div>
          <div className='font-thin text-sm'>
            <div>Created a system in JavaScript to automatically find and redeem free Chipotle Entree codes via SMS. Continuously scanned for free Chipotle codes from various sources. Used a VOIP service and CLI to send mass SMS messages to Chipotle{"'"}s number, 888222. Sent collected codes to Chipotle{"'"}s number for successful redemption. Achieved automated and reliable free Chipotle Entree code redemption.</div>
          </div>
      </div>
      <div className='text-2xl pb-10'>
          <div className=' flex flex-row text-2xl font-thin w-full justify-between pb-4'>
            <div>Vanity Ethereum Address Generator</div>
            <div>5/2022 - 6/2022</div>
          </div>
          <div className='font-thin text-sm'>
            <div>Developed a Javascript application that allows users to specify a custom prefix for their Ethereum {'(ETH)'} wallet address. The application generates wallet addresses iteratively until a matching address with the user{"'"}s specified prefix is found. Provided users with the ability to obtain ETH wallet addresses that align with their chosen prefix, enhancing the personalization and usability of their cryptocurrency wallets.</div>
          </div>
      </div>
    </section>
 </main>
  )
}