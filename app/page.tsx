'use client'
import gitHubIcon from '../public/github_icon.svg'
import emailIcon from '../public/email_icon.svg'
import ghostIcon from '../public/ghost_blog.svg'
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
		{ icon: saikouIcon, text: 'Korean BBQ' },
		{ icon: saikouIcon, text: 'Quantitative Finance' },
		{ icon: studyIcon, text: 'Competitive Programming' },
		{ icon: studyIcon, text: 'C++, Python, Typescript, Golang, Rust' },
		{ icon: studyIcon, text: 'Machine Learning' },
		{ icon : saikouIcon, text: 'Judo'},
		{ icon: saikouIcon, text: 'Release Hallucination' },
		{ icon: saikouIcon, text: 'Elfensjon' },
		{ icon: foodIcon, text: 'Takoyaki, Sushi, Katsu' },
		{ icon: saikouIcon, text: 'Curry Udon' },
		{ icon: musicIcon, text: 'JRock, JMetal, JPop' },
		{ icon: foodIcon, text: 'BBQing' },
		{ icon: musicIcon, text: 'Hardcore, Hardstyle, Frenchcore' },
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
				<div className='md:text-lg xl:text-xl 2xl:text-2xl font-thin'>I&apos;m Leon, a {calculateYearsSinceDate("03/07/2004")} years old apiring software engineer at
					the California State University of Long Beach, majoring in Computer Science with a minor in Pure Mathematics.
					My journey into programmming began in high school around {calculateYearsSinceDate("02/28/2021")} years ago, sparked by
					my interest in the sneaker reselling industry. While building my first major project and sneaker bot, Rias Software, I realized I became
					obsessed with automation, reverse-engineering, and optimization.

					Since then, I&apos;ve completely fallen in love with building through the art of programming. For me, programming isn&apos;t just code.
					It&apos;s problem solving, system elegance under pressure, and the thrill of turning abstract ideas into performant, real-world solutions.

					These days, I focus on Low-Latency Engineering, profiling, optimizing, and reshaping performance across both software and hardware levels,
					from algorithmic design to cache layouts—until my code paths performs like an orchestra.
				</div>
			</div>
			<div className='flex flex-row flex-wrap w-full justify-start items-start mb-[72px]'>
				<Socials icon={gitHubIcon} link='https://github.com/yushasama' text='yushasama' color='fuschia'/>
				<Socials icon={linkedinIcon} link='https://www.linkedin.com/in/leon-do-682003156/' text='Leon Do' color='blue'/>
				<Socials icon={emailIcon} link='/' text='leontdo2004@gmail.com' color='teal'/>
				<Socials icon={ghostIcon} link='https://cache-me-if-you-can.up.railway.app/' text='Blog' color='hot_pink'/>
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
					Built modular factor modeling framework using Python and CUDA acceleration, enabling extensible integration of matrix profile algorithms and neural network models for price prediction workflows.
					Accelerated computation by 60% through GPU-based processing with NVIDIA CUDA/CuPy, reducing model training latency for large financial datasets.
					Optimized data processing pipelines using Polars, improving end-to-end workflow efficiency of time series data analysis.
					Developed orthogonalization algorithms for independent factor construction, removing correlation dependencies between predictive variables in multi-asset models.
					Applied quantitative research methodologies in 2024 CFAOC RFP Competition, securing 1st place and $115K in funding for the student managed investment fund.
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
					Led cross-functional development team to architect cryptocurrency trading platform using TypeScript and GoLang, managing technical roadmap.
					Achieved 70% faster signal detection than established market intelligence platforms by implementing asynchronous polling systems with circular queue-based resource management, reducing latency under API rate constraints.
					Built transaction execution pipelines with automated processing workflows, implementing complex blockchain integration and low-level protocol handling, enabling reliable trading operations on Solana blockchain.
					Engineered monitoring infrastructure, handling data streams and event-driven processing for scalable performance.
					</>
				}
			/>
			<Experiences
				companyName='High-Performance Monte Carlo Benchmarking Engine'
				startDate='5/2025'
				endDate='5/2025'
				details={
					<>
					Achieved 10× performance improvement by developing SIMD-accelerated simulation engine in C++17, delivering low-latency systems through vectorization and rigorous memory management.
					Demonstrated expertise in x86 AMD/Intel microarchitecture by analyzing cache hierarchies (L1/L2/L3) and discovering spillover patterns through hardware performance counters.
					Reduced cache miss rates from 25% to 5% by implementing custom bump allocator and increased IPC by 3× through memory alignment optimization and latency reduction.
					Achieved 8-17× CPU throughput improvement using branchless SIMD algorithms (_mm256_cmp_pd, bitmasking) enabling parallel batch processing with low-latency execution.
					Built high-throughput data pipeline with Python, SQL, Bash, Polars, Parquet storage, and data visualization via Grafana + ClickHouse.
					Ensured cross-platform compatibility and implemented CI pipeline with GitHub Actions and CMake build system.
					</>
				}
			/>
			<Experiences
			companyName='Tsundebugger'
			startDate='1/2025'
			endDate='1/2025'
			details={
				<>
				Currently developing a cross-platform testing framework in C++ to execute and validate Python algorithms with process isolation. Achieved robust error handling and resource management using Boost libraries for Inter-Process Communication, multi-threading, and filesystem operations.
				Implemented concurrent test execution with thread-safe result handling for improved performance.
				Developed using Bazel build system for reproducible builds across Unix/Linux and Windows environments.
				Enabled concurrent test execution, reducing test suite runtimes by 60%, improving CI/CD workflows.
				</>
			}
			/>
			<Experiences
				companyName='VisionPay'
				startDate='10/2024'
				endDate='10/2024'
				details={
					<>
					Worked with a team to develop VisionPay, a computer vision powered self checkout system for MarinaHacks.
					Designed and deployed scalable ML infrastructure with automated preprocessing pipelines, reducing training time by 30% and enabling efficient, consistent data handling for model deployment.
					Integrated backend systems with front-end architecture, enabling real-time item recognition and receipt generation.
					</>
				}
			/>
			<Experiences
			companyName='Rust-Based Financial Data Aggregator'        
			role=''
			startDate='7/2024'
			endDate='7/2024'
			details={
				<>
				Collected and aggregated financial data through the web scraping of various financial websites.
				Engineered a data processing pipeline to clean and structure data efficiently, reducing data processing time by 30%.
				Optimized code structure with modular design and object-oriented programming, improving code maintainability and scalability, which facilitated easy updates and extensions to the tool.
				Utilized text processing algorithms, increasing accuracy of aggregated data.
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
				Engineered Javascript & Python based software solutions for automating retail purchases, raffle entry, and interactions with cryptocurrency networks to accrue limited items.
				Designed and scaled the application to handle concurrent tasks, ensuring a robust and maintainable codebase through object-oriented programming.
				Developed and optimized data scraping solutions to collect and process product-related data efficiently, handling thousands of lines of data from various sources.
				Utilized multithreading and task queuing, preventing lag and resource clogging during software usage.
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