// @AI-HINT: This is the Home page root component. All styles are per-component only. See Home.common.css, Home.light.css, and Home.dark.css for theming.
import React from "react";
import Button from '@/app/components/Button/Button';
import "./Home.common.css";
import "./Home.light.css";
import "./Home.dark.css";

interface HomeProps {
  theme?: "light" | "dark";
}

const Home: React.FC<HomeProps> = ({ theme = "light" }) => {
  return (
    <div className={`Home Home--${theme}`}>
      <header className="Home-header">
        <h1 className="Home-title">MegiLance</h1>
        <p className="Home-tagline">Empowering Freelancers with AI and Secure USDC Payments</p>
        <div className="Home-cta">
          <a href="/Signup" className="Home-link">
            <Button theme={theme} variant="primary">Sign Up</Button>
          </a>
          <a href="/Login" className="Home-link">
            <Button theme={theme} variant="secondary">Log In</Button>
          </a>
        </div>
      </header>
      <section className="Home-features">
        <h2>Why MegiLance?</h2>
        <ul className="Home-features-list">
          <li>⚡ AI-powered price estimation & smart proposals</li>
          <li>🔒 Crypto wallet integration for secure USDC payments</li>
          <li>🌍 Connects Pakistani freelancers with global clients</li>
          <li>💼 Instant, low-fee payouts—no banking hassle</li>
        </ul>
      </section>
      <section className="Home-highlights">
        <div className="Home-highlight">
          <h3>AI for Freelancers</h3>
          <p>Automated job matching, proposal writing, and price suggestions using state-of-the-art AI.</p>
        </div>
        <div className="Home-highlight">
          <h3>USDC Payments</h3>
          <p>Get paid instantly in stablecoins with full wallet-to-wallet security and transparency.</p>
        </div>
        <div className="Home-highlight">
          <h3>Wallet-First Platform</h3>
          <p>Sign up, log in, and transact using your crypto wallet—no bank account required.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
