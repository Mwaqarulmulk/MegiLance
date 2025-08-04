// @AI-HINT: This is the Contact page root component. All styles are per-component only. See Contact.common.css, Contact.light.css, and Contact.dark.css for theming.
'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import './Contact.common.css';
import './Contact.light.css';
import './Contact.dark.css';

interface ContactProps {
  theme?: 'light' | 'dark';
}

const Contact: React.FC<ContactProps> = ({ theme = 'light' }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Contact form submitted:', formData);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className={`Contact Contact--${theme}`}>
      <div className="Contact-container">
        <header className="Contact-header">
          <h1>Get in Touch</h1>
          <p>Have a question or feedback? We&apos;d love to hear from you.</p>
        </header>

        <div className="Contact-content-wrapper">
          <div className="Contact-form-container">
            {submitted ? (
              <div className="Contact-success-message">
                <h3>Thank You!</h3>
                <p>Your message has been sent. We&apos;ll get back to you shortly.</p>
              </div>
            ) : (
              <form className="Contact-form" onSubmit={handleSubmit} noValidate>
                <Input
                  theme={theme}
                  label="Full Name"
                  type="text"
                  placeholder="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  theme={theme}
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <div className="Input-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="How can we help?"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <Button theme={theme} variant="primary" fullWidth type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
          <div className="Contact-info-container">
            <h3>Contact Information</h3>
            <p>For support or general inquiries, please email us.</p>
            <a href="mailto:support@megilance.com">support@megilance.com</a>
            <h4>Follow Us</h4>
            <div className="Contact-social-links">
              {/* Add social links later */}
              <p>Twitter, LinkedIn, etc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
