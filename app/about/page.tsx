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
    { icon: saikouIcon, text: 'Competitive Programming' },
    { icon: saikouIcon, text: 'C++'},
    { icon: studyIcon, text: 'Machine Learning' },
    { icon: studyIcon, text: 'Operating Systems' },
    { icon: studyIcon, text: 'Hardware Engineering'},
    { icon: foodIcon, text: 'Cooking' },
    { icon: studyIcon, text: 'Judo' },
    { icon: saikouIcon, text: 'Curry Udon' },
    { icon: musicIcon, text: 'Hyperpop' }
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
                 <Link className="text-blue-400" link="/blog" text="blog" highlightNav="blog"></Link> where I write about my projects, thoughts,
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
						<Socials icon={ghostIcon} link='/blog' text='Blog' color='hot_pink'/>
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
          <Experiences companyName="Zwei Labs" role="Software Engineering Intern" startDate="10/2025" endDate="1/2026" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Developed a real-time Python trading backend for market data, live order books, strategy execution, and pre-trade risk checks.</li>
              <li>Scaled to 40+ concurrent markets using independent async workers and WebSocket streams, isolating slow feeds from unrelated markets.</li>
              <li>Added bounded queues, backpressure, deterministic event ordering, and exact decimal pricing to preserve correctness under load.</li>
            </ul>
          } />
          <Experiences companyName="Beach Investment Group" role="Quantitative Developer Intern" startDate="6/2024" endDate="5/2025" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Created a scalable Python/Polars data pipeline used by 25+ analysts for ingestion, preprocessing, model training, and prediction delivery.</li>
              <li>Accelerated NumPy with CuPy / CUDA, cutting experiment times from hours to minutes and increasing research throughput.</li>
              <li>Implemented reusable factor-model and time-series tools with scikit-learn; forecasts supported funding proposals that secured $115K.</li>
            </ul>
          } />
        </section>

        {/* PROJECTS */}
        <section id="projects" className="flex flex-col justify-start w-full">
          <div className="text-xl sm:text-2xl md:text-3xl xl:text-4xl pb-4 font-heebo">Projects & Ventures</div>
          <Experiences companyName={<AwesomeLink text="BPCure" link="https://bpcure.app" />} startDate="5/2026" endDate="Present" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Built a full-stack exam prep platform with React, TypeScript, Supabase, and Vercel that generates practice questions from user-uploaded material, used by peers to study for exams and technical interviews.</li>
              <li>Implemented autosave so users never lose progress mid-exam, syncing drafts to the cloud in the background with conflict resolution across devices.</li>
              <li>Built a one-click course sharing system where users generate a link and recipients instantly import the full course, ready to take exams with no setup.</li>
            </ul>
          } />
          <Experiences companyName="Video Streaming Platform" startDate="5/2026" endDate="6/2026" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Assisted in stabilizing a short-form video platform after a 20,000+ user launch spike by diagnosing performance issues and infrastructure bottlenecks.</li>
              <li>Reduced server load by 98% during a 20,000+ user launch spike by eliminating duplicate requests and preventing redundant API calls.</li>
              <li>Improved user load time from 14s to 1.3s by lazy loading chunked data instead of blocking on full upfront fetches.</li>
            </ul>
          } />
          <Experiences companyName="MaguroPlace - GPU-Accelerated Placement Optimizer" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Created a GPU-accelerated optimization engine in Python/PyTorch that produced valid layouts across all 17 benchmarks.</li>
              <li>Improved evaluation throughput 18x, from 11 minutes to 38 seconds, by profiling bottlenecks and caching reusable benchmark data.</li>
              <li>Reduced the mean challenge score 47% (2.09 to 1.10), beating the published 1.46 baseline.</li>
            </ul>
          } />
          <Experiences companyName="ASIC Reverse Engineering" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Built Python EDA tooling that automatically recovered a gate-level netlist and signal connectivity from a final GDSII physical layout.</li>
              <li>Generated structural Verilog and verified the recovered design through simulation against standard-cell models.</li>
              <li>Converted the circuit into a graph, collapsed feedback loops, and used 2-SAT to avoid repeated compile-and-simulate search loops.</li>
            </ul>
          } />
          <Experiences companyName="DeepMew - Resumable Cloud Jobs" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Ran distributed PyTorch workloads on Modal cloud workers with checkpointing, restart recovery, and cost controls for fault tolerance.</li>
              <li>Improved reliability by fixing a checkpoint bug that erased progress after worker restarts; verified the fix across more than 400K games.</li>
              <li>Scaled a rate-limited data pipeline from 1,543 replays to 180K training rows while staying within API limits.</li>
            </ul>
          } />
          <Experiences companyName="Blotto - Strategy Optimization & Opponent Modeling" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Built a Python research engine for Colonel Blotto, modeling opponent allocation patterns with strategy clustering and population forecasts.</li>
              <li>Implemented Numba-accelerated simulated annealing with parallel restarts to search allocations under scenario-specific payoff rules.</li>
              <li>Built walk-forward backtests and model ablations to compare predicted strategies against future opponent fields, keeping post-hoc analysis separate from forecasts.</li>
            </ul>
          } />
          <Experiences
            companyName={<AwesomeLink text="Real-Time Face Tracking & Expression Mapping Software" link="https://github.com/RyanHernandezz/Vtuber/" />}
            startDate="9/2025"
            endDate="12/2025"
            details={
              <>
              Built a real-time ML pipeline mapping webcam input to avatar expressions using face tracking and lightweight emotion inference.
              Optimized streaming inference via data reduction, multithreading, and latency-first tuning, maintaining sub 5 ms end-to-end latency.
              Structured the system as parallel stages (capture, inference, smoothing) to avoid blocking and stabilize frame-time.
              Exposed a WebSocket-based real-time API enabling low-latency client synchronization and streaming.
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
            companyName="Chewse"
            startDate="8/2025"
            endDate="9/2025"
            details={
              <>
              Built a backend coordinating real-time shared session state between paired users using Redis.
              Reduced match detection from O(n) to O(1) using Redis Sets, enabling fast responses as session size scaled.
              Containerized services with Docker and deployed on AWS using Kubernetes and Terraform.
              Implemented autoscaling, health checks, and rolling updates to support reliable production deployments.
              Improved request throughput by optimizing concurrent request handling in Go.
              </>
            }
          />

          <Experiences companyName={<AwesomeLink text="Tori - Concurrent Monitor" link="https://github.com/yushasama/tori" />} startDate="7/2025" endDate="7/2025" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Designed a concurrent Go service with isolated workers, retry/backoff, and clean context cancellation.</li>
              <li>Kept memory usage predictable under load with backpressure, bounded queues, and rate limiting.</li>
              <li>Added observability with Go pprof and runtime metrics for CPU, memory, contention, garbage collection, and worker health.</li>
            </ul>
          } />

          <Experiences companyName={<AwesomeLink text="Monte Carlo Benchmarking Engine" link="https://github.com/yushasama/montecarlo-benchmarking-engine" />} startDate="5/2025" endDate="5/2025" details={
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Engineered a C++17 performance engine with AVX2 SIMD, multithreading, thread-local state, and preallocated memory.</li>
              <li>Increased throughput 11x, processing 100M trials in 106 ms versus 1.19 seconds sequentially.</li>
              <li>Profiled CPU performance with Linux perf, tracking IPC, cache misses, branch misses, and cycles per trial.</li>
            </ul>
          } />

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
