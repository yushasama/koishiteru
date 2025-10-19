'use client'
import React from 'react'
import Carousel from '../components/Carousel'

const panels = [
  {
    title: "About Me",
    subtitle: "My Journey",
    image: "home/panels/about.jpg",
    link: "/about",
  },
  {
    title: "Competitive Programming",
    subtitle: "Algorithmic Writeups",
    image: "home/panels/competitive.jpg",
    link: "/competitive",
  },
  {
    title: "Blog",
    subtitle: "Infrastructure, Systems, Optimization & More",
    image: "home/panels/blog.jpg",
    link: "http://cache-me-if-you-can.up.railway.app/",
  },
  {
    title: "Personal Research",
    subtitle: "Reading List & Applied Thought ",
    image: "home/panels/research.jpg",
    link: "/research",
  },
  {
    title: "My Life",
    subtitle: "Behind The Chaos",
    image: "home/panels/life.jpg",
    link: "/life",
  },
  {
    title: "Contact Me",
    subtitle: "Ways to Connect",
    image: "home/panels/contact.jpg",
    link: "/contact",
  },
];

export default function Home() {
  return (
    <main className='h-screen'>
      <Carousel panels={panels}/>
    </main>
  );
}