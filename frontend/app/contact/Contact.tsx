// @AI-HINT: Contact page with premium, theme-aware design, animations, and accessibility. Uses per-component CSS modules.
'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

import commonStyles from './Contact.common.module.css';
import lightStyles from './Contact.light.module.css';
import darkStyles from './Contact.dark.module.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(containerRef, { threshold: 0.1 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    const nextErrors: typeof errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      nextErrors.name = 'Please enter your full name (min 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.message || formData.message.trim().length < 10) {
      nextErrors.message = 'Please enter a brief message (min 10 characters).';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    console.log('Contact form submitted:', formData);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <main
      id="main-content"
      role="main"
      ref={containerRef}
      className={cn(commonStyles.contactPage, commonStyles.isNotVisible, { [commonStyles.isVisible]: isVisible })}
    >
      <div className={cn(commonStyles.container, themeStyles.container)}>
        <header className={cn(commonStyles.header, themeStyles.header)}>
          <h1 className={cn(commonStyles.title, themeStyles.title)}>Get in Touch</h1>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>Have a question or feedback? We&apos;d love to hear from you.</p>
        </header>

        <div className={cn(commonStyles.contentWrapper)}>
          <section className={cn(commonStyles.formContainer, themeStyles.formContainer)} aria-label="Contact form">
            {submitted ? (
              <div className={cn(commonStyles.successMessage, themeStyles.successMessage)} role="status" aria-live="polite">
                <h3>Thank You!</h3>
                <p>Your message has been sent. We&apos;ll get back to you shortly.</p>
              </div>
            ) : (
              <form className={cn(commonStyles.form)} onSubmit={handleSubmit} noValidate>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className={cn(commonStyles.errorText)} role="alert">
                    {errors.name}
                  </p>
                )}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className={cn(commonStyles.errorText)} role="alert">
                    {errors.email}
                  </p>
                )}
                <div className={cn(commonStyles.textareaGroup)}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className={cn(commonStyles.textarea, themeStyles.textarea)}
                    placeholder="How can we help?"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                </div>
                {errors.message && (
                  <p id="message-error" className={cn(commonStyles.errorText)} role="alert">
                    {errors.message}
                  </p>
                )}
                <Button variant="primary" fullWidth type="submit" disabled={loading} aria-busy={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </section>
          <section className={cn(commonStyles.infoContainer, themeStyles.infoContainer)} aria-labelledby="contact-info">
            <h3 id="contact-info">Contact Information</h3>
            <p>For support or general inquiries, please email us at your convenience. We aim to respond to all queries within 24 hours.</p>
            <a href="mailto:support@megilance.com" className={cn(commonStyles.emailLink, themeStyles.emailLink)}>support@megilance.com</a>
            {/* Social links can be added here later */}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Contact;
