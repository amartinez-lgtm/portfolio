import { useEffect } from 'react'
import AuroraBackground from './components/AuroraBackground'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Work from './components/Work'
import SideHustles from './components/SideHustles'
import CareerStories from './components/CareerStories'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'

export default function App() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <>
      <AuroraBackground showGrid={false} />
      <Nav />
      <main>
        <Hero />
        <About />
        <Work />
        <SideHustles />
        <CareerStories />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
