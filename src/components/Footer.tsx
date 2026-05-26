import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__name">Avelino Martinez</span>
        <span className="footer__copy">
          © {new Date().getFullYear()} · Leva LLC · Built with React + Vite, deployed on Cloudflare Pages
          {' · '}
          <a href="/token" className="footer__token-link">◈ Token</a>
        </span>
      </div>
    </footer>
  )
}
