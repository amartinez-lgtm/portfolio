import AuroraBackground from './components/AuroraBackground'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Work from './components/Work'
import SideHustles from './components/SideHustles'
import CareerStories from './components/CareerStories'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
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
    </>
  )
}
