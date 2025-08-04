// @AI-HINT: This is the Signup page root component. All styles are per-component only. See Signup.common.css, Signup.light.css, and Signup.dark.css for theming.
import React from "react";
import Input from "../components/Input/Input";
import Button from "../components/Button/Button";
import "./Signup.common.css";
import "./Signup.light.css";
import "./Signup.dark.css";

interface SignupProps {
  theme?: "light" | "dark";
}

const Signup: React.FC<SignupProps> = ({ theme = "light" }) => {
  return (
    <div className={`Signup Signup--${theme}`}>
      <header className="Signup-header">
        <h1>Create Your Account</h1>
      </header>
      <main className="Signup-main">
        <form className="Signup-form">
          <label htmlFor="name">Name</label>
          <Input theme={theme} id="name" name="name" placeholder="Your full name" required />
          <label htmlFor="email">Email</label>
          <Input theme={theme} id="email" name="email" type="email" placeholder="you@email.com" required />
          <label htmlFor="password">Password</label>
          <Input theme={theme} id="password" name="password" type="password" placeholder="Create a password" required />
          <Button theme={theme} variant="primary" type="submit">Sign Up</Button>
        </form>
      </main>
    </div>
  );
};

export default Signup;
