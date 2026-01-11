'use client'
import gitHubIcon from '../../public/about/icons/github_icon.svg'
import emailIcon from '../../public/about/icons/email_icon.svg'
import ghostIcon from '../../public/about/icons/ghost_blog.svg'
import foodIcon from '../../public/about/icons/food_icon.svg'
import saikouIcon from '../../public/about/icons/saikou_icon.svg'
import studyIcon from '../../public/about/icons/study_icon.svg'
import musicIcon from '../../public/about/icons/music_icon.svg'
import linkedinIcon from '../../public/about/icons/linkedin_icon.svg'
import { Interests } from '@/components/Interests'
import React, { useEffect, useState } from 'react'
import { Socials } from '@/components/Socials'
import { Experiences } from '@/components/Experience'
import { AwesomeLink, Link } from '@/components/Link'

export default function About() {
  const [currentSong, setCurrentSong] = useState({ title: '', artist: '' })

  const fetchCurrentSong = async () => {
    try {
      const res = await fetch('/api/spotify')
      if (res.ok) {
        const data = await res.json()
        setCurrentSong(data)
      } else {
        console.error('Failed to fetch current song')
      }
    } catch (error) {
      console.error('Error fetching current song', error)
    }
  }

  useEffect(() => {
    fetchCurrentSong()
    const interval = setInterval(() => fetchCurrentSong(), 5000)
    return () => clearInterval(interval)
  }, [])

  const interestsData = [
    { icon: saikouIcon, text: 'Korean BBQ' },
    { icon: saikouIcon, text: 'Quantitative Finance' },
    { icon: studyIcon, text: 'Competitive Programming' },
    { icon: studyIcon, text: 'C++, Python, Typescript, Golang, Rust' },
    { icon: studyIcon, text: 'Machine Learning' },
    { icon: saikouIcon, text: 'Judo' },
    { icon: saikouIcon, text: 'Release Hallucination' },
    { icon: saikouIcon, text: 'Elfensjon' },
    { icon: foodIcon, text: 'Takoyaki, Sushi, Katsu' },
    { icon: saikouIcon, text: 'Curry Udon' },
    { icon: musicIcon, text: 'JRock, JMetal, JPop' },
    { icon: foodIcon, text: 'BBQing' },
    { icon: musicIcon, text: 'Hardcore, Hardstyle, Frenchcore' },
  ]

  const sortedInterests = interestsData.sort((a, b) => {
    if (a.icon === saikouIcon && b.icon !== saikouIcon) return -1
    if (a.icon !== saikouIcon && b.icon === saikouIcon) return 1
    return 0
  })

  const calculateYearsSinceDate = (date: string) => {
    const startDate = new Date(date)
    const today = new Date()
    let years = today.getFullYear() - startDate.getFullYear()
    const monthDiff = today.getMonth() - startDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < startDate.getDate())) {
      years--
    }
    return years
  }

  return (
    <>
       <main className="flex flex-col pt-20 pb-24 px-4 sm:px-8 md:px-16 lg:px-[10%] items-center justify-center bg-chicago bg-no-repeat bg-cover bg-center min-h-screen overflow-x-hidden relative">
         <div className="absolute inset-0 bg-black/70 backdrop-blur-xs"></div>
         <div className="relative z-10 w-full">
        {/* INTRODUCTION */}
        <section id="introduction" className="pb-4 w-full">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-heebo">Leon Do</div>

            {currentSong?.title ? (
              <div className="text-sm sm:text-base xl:text-lg 2xl:text-xl text-viral pt-1 font-light font-gothic break-words">
                ・Currently listening to {currentSong.title} - {currentSong.artist}
              </div>
            ) : (
              <div className="text-sm sm:text-base xl:text-lg 2xl:text-xl text-rias pt-1 font-light font-gothic">
                ・No songs playing at the moment
              </div>
            )}
          </div>

          <div className="pt-4 pb-12">
            <div className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-thin space-y-6 leading-relaxed break-words">
              <p>
                I&apos;m Leon, a {calculateYearsSinceDate('03/07/2004')}-year-old aspiring software engineer at the California State University of Long
                Beach, majoring in Computer Science with a minor in Pure Mathematics. My journey into programming began in high school around{' '}
                {calculateYearsSinceDate('02/28/2021')} years ago, sparked by my interest in the sneaker reselling industry. While building my first
                major project and sneaker bot, Rias Software, I realized I became obsessed with automation, reverse-engineering, and optimization.
              </p>

              <p>
                Since then, I&apos;ve completely fallen in love with building through the art of programming. For me, programming isn&apos;t just code.
                It&apos;s problem solving, system elegance under pressure, and the thrill of turning abstract ideas into performant, real-world
                solutions.
              </p>

              <p>
                These days, I spend my time building & optimizing systems / infrastructure software, along with solving algorithmic challenges. Do please
                 check out my{' '}
                 <Link className="text-blue-400" link="http://cache-me-if-you-can.ghost.io/" text="blog" highlightNav="blog"></Link> where I write about my projects, thoughts,
                 & random blurbs about things I find interesting. For my algorithmically hungry friends, I write detailed{' '}
                 <Link className="text-blue-400" text="breakdowns" link="/competitive" highlightNav="competitive"></Link> on various competitive programming
                topics.
              </p>
            </div>
          </div>
					<div className='flex flex-row flex-wrap w-full justify-start items-start mb-[72px]'>
						<Socials icon={gitHubIcon} link='https://github.com/yushasama' text='yushasama' color='fuschia'/>
						<Socials icon={linkedinIcon} link='https://www.linkedin.com/in/leon-do-682003156/' text='Leon Do' color='blue'/>
						<Socials icon={emailIcon} link='/' text='leontdo2004@gmail.com' color='teal'/>
						<Socials icon={ghostIcon} link='https://cache-me-if-you-can.up.railway.app/' text='Blog' color='hot_pink'/>
					</div>
        </section>

        {/* INTERESTS */}
        <section id="interests" className="flex flex-col justify-start items-start w-full mb-16">
           <div className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-heebo mb-4">Recent Interests</div>
           <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-4">
             {sortedInterests.map((interest, index) => (
               <Interests key={index} icon={interest.icon} text={interest.text} />
             ))}
           </div>
         </section>

        {/* EXPERIENCE */}
        <section id="experiences" className="flex flex-col justify-start w-full mb-16">
          <div className="text-xl sm:text-2xl md:text-3xl xl:text-4xl pb-4 font-heebo">Experience</div>
          <Experiences
          companyName="Zwei Labs"
          role="Software Engineer Intern"
          startDate="10/25"
          endDate="PRESENT"
          details={
            <>
            Built and designed distributed backend systems supporting real-time trading operations on prediction markets. 
            Designed a decimal-safe math library to eliminate floating-point drift and ensure consistent results for high-frequency workloads. 
            Built a high-throughput backend to update quotes and track inventory, reducing end-to-end response latency under continuous trading load.
            Built a concurrent routing layer to manage multiple real-time market feeds asynchronously, scaling with increased data volume without blocking.
            </>
          }
          />
          <Experiences
            companyName="Beach Investment Group"
            role="Quantitative Developer Intern"
            startDate="6/2024"
            endDate="5/2025"
            details={
              <>
                Built modular factor modeling framework using Python and CUDA acceleration, enabling extensible integration of matrix profile
                algorithms and neural network models for price prediction workflows. Accelerated computation by 60% through GPU-based processing with
                NVIDIA CUDA/CuPy, reducing model training latency for large financial datasets. Optimized data processing pipelines using Polars,
                improving end-to-end workflow efficiency of time series data analysis. Developed orthogonalization algorithms for independent factor
                construction, removing correlation dependencies between predictive variables in multi-asset models. Applied quantitative research
                methodologies in 2024 CFAOC RFP Competition, securing 1st place and $115K in funding for the student managed investment fund.
              </>
            }
          />
        </section>

        {/* PROJECTS */}
        <section id="projects" className="flex flex-col justify-start w-full">
          <div className="text-xl sm:text-2xl md:text-3xl xl:text-4xl pb-4 font-heebo">Projects & Ventures</div>
          <Experiences
            companyName={<AwesomeLink text="Real-Time Face Tracking & Expression Mapping Software" link="https://github.com/RyanHernandezz/Vtuber/" />}
            startDate="9/2025"
            endDate="12/2025"
            details={
              <>
              Built a real-time pipeline mapping webcam input to avatar expressions using face tracking and emotion recognition models. 
              Optimized model serving and streaming inference through data reduction, multithreading, and latency-oriented performance tuning, staying under 5 ms end-to-end.
              Structured the system as parallel stages (capture, inference, smoothing) to avoid blocking and maintain consistent responsiveness.
              Integrated a WebSocket-based real-time data API for external clients, enabling continuous low-latency synchronization.
              </>
            }
          />
          <Experiences
            companyName={<AwesomeLink text="Scribble" link="https://scribble-ivory.vercel.app/" />}
            startDate="10/2025"
            endDate="10/2025"
            details={
              <>
                Built a client-side Markdown compiler integrating MathJax, Mermaid, and syntax highlighting into a real-time rendering pipeline.
                Architected the rendering pipeline with modular abstractions to simplify future contributor onboarding and code reuse. Enhanced
                scalability through incremental parsing and Web Worker parallelism, sustaining sub-frame responsiveness on large documents.
              </>
            }
          />

          <Experiences
            companyName={<AwesomeLink text="Clopboard" link="https://github.com/yushasama/clopboard" />}
            startDate="9/2025"
            endDate="9/2025"
            details={
              <>
                Developed a Python-based automation tool that replicates server configurations between Discord communities. Utilized Discord API
                (discord.py v2) to manage roles, channels, and permissions with built-in rate-limit handling. Designed a config-driven, modular
                architecture enabling scalability and ease of extension. Implemented command-driven interaction (CLI + slash commands) and clear
                progress tracking for users. Emphasized API reliability, error handling, and maintainable code structure for production stability.
              </>
            }
          />

          <Experiences
            companyName={<AwesomeLink text="Chewse" link="https://github.com/yushasama/chewse" />}
            startDate="8/2025"
            endDate="9/2025"
            details={
              <>
                Built and integrated a Redis-backed session system with TTL expiry, enabling ephemeral shared swipe rooms and real-time sync across
                paired users. Reduced Google Places API calls by ~40% through caching, request coalescing, and adaptive rate-limiting, improving
                scalability and cutting infra costs. Developed a partner-adaptive re-ranking engine that personalized results based on shared
                preferences, boosting match conversion by ~25%. Prototyped a Go microservice adapter with goroutine pooling to improve concurrent
                throughput and lay groundwork for modular service design.
              </>
            }
          />

          <Experiences
            companyName={<AwesomeLink text="Tori" link="https://github.com/yushasama/tori" />}
            startDate="7/2025"
            endDate="7/2025"
            details={
              <>
                Designed a burst-tolerant event dispatcher with sliding-window rate limiting and timestamp pruning for high-throughput workloads.
                Implemented lock-free ring buffers using bitmask indexing to cut CPU overhead and reduce branching in critical paths. Minimized GC
                impact with preallocated structs and slice reuse, maintaining consistent latency under load.
              </>
            }
          />

          <Experiences
            companyName={<AwesomeLink text="High Performance Monte Carlo Benchmark Engine" link="https://github.com/yushasama/montecarlo-benchmarking-engine" />}
            startDate="5/2025"
            endDate="5/2025"
            details={
              <>
                Achieved 10× performance improvement by developing SIMD-accelerated simulation engine in C++17. Demonstrated expertise in x86 AMD/Intel
                microarchitecture by analyzing cache hierarchies and performance counters. Reduced cache miss rates from 25% to 5% with a custom bump
                allocator, and increased IPC by 3× through memory alignment optimization. Implemented CI/CD with GitHub Actions and CMake build system.
              </>
            }
          />

          <Experiences
            companyName={<AwesomeLink text="Tsundebugger" link="https://github.com/yushasama/tsundebugger" />}
            startDate="1/2025"
            endDate="1/2025"
            details={
              <>
                Built a cross-platform testing framework in C++ to execute and validate Python algorithms with process isolation. Used Boost libraries
                for Inter-Process Communication and multi-threading. Implemented concurrent test execution with thread-safe result handling, reducing
                test suite runtimes by 60% and improving CI/CD workflows.
              </>
            }
          />

          <Experiences
            companyName={<AwesomeLink text="VisionPay" link="https://github.com/yushasama/vision_pay" />}
            startDate="10/2024"
            endDate="10/2024"
            details={
              <>
                Worked on VisionPay, a computer vision powered self-checkout system for MarinaHacks. Designed ML infrastructure with automated
                preprocessing pipelines, reducing training time by 30%. Integrated backend systems with frontend for real-time recognition and receipt
                generation.
              </>
            }
          />

          <Experiences
            companyName="Mirai Research"
            startDate="5/2024"
            endDate="7/2024"
            details={
              <>
                Led development of a cryptocurrency trading platform using TypeScript and GoLang. Implemented asynchronous polling systems with circular
                queue-based resource management, achieving 70% faster signal detection. Built blockchain integration pipelines for reliable Solana
                trading operations.
              </>
            }
          />

          <Experiences
            companyName="Rust-Based Financial Data Aggregator"
            startDate="7/2024"
            endDate="7/2024"
            details={
              <>
                Collected and aggregated financial data through web scraping. Engineered a modular data processing pipeline using Rust, reducing
                processing time by 30%. Improved maintainability and extensibility through clean, modular design.
              </>
            }
          />

          <Experiences
            companyName="Desktop Application for Sorting Manga Work"
            startDate="6/2023"
            endDate="6/2023"
            details={
              <>
                Created a Windows application with ElectronJS to automate manga categorization using scraped metadata. Integrated results into
                Raindrop.io for organized management. Reduced manual sorting time by ~97%.
              </>
            }
          />

          <Experiences
            companyName="Chipotle Rewards Bot"
            startDate="11/2022"
            endDate="12/2022"
            details="Created a JS app that auto-redeemed Chipotle entree codes via SMS using VOIP. Scanned APIs and redeemed hundreds of codes, generating 4-figure value."
          />

          <Experiences
            companyName="Ethereum Vanity Address Generator"
            startDate="5/2022"
            endDate="6/2022"
            details={
              <>
                Built a JS app that generates Ethereum wallet addresses with custom prefixes. Enabled users to obtain personalized ETH addresses by
                brute-force iteration.
              </>
            }
          />

          <Experiences
            companyName="Rias Software"
            startDate="8/2021"
            endDate="6/2022"
            details={
              <>
                Developed JS and Python tools automating retail purchases and raffle entries. Scaled concurrent task execution and optimized data
                scraping pipelines to handle thousands of records efficiently.
              </>
            }
          />
        </section>

        {/* FOOTER */}
        <footer className="mt-20 flex flex-col w-full justify-center items-center font-thin text-sm sm:text-base text-center">
          <div>koishiteru・恋してる</div>
          <div>falling in love {'<'}3</div>
        </footer>
         </div>
      </main>
    </>
  )
}
