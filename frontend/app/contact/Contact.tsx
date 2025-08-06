// @AI-HINT: This is the Contact page root component, refactored to use next-themes and modular CSS.
'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import styles from './Contact.module.css';

const Contact: React.FC = () => {
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
    <div className={styles.contactPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Get in Touch</h1>
          <p className={styles.subtitle}>Have a question or feedback? We&apos;d love to hear from you.</p>
        </header>

        <div className={styles.contentWrapper}>
          <div className={styles.formContainer}>
            {submitted ? (
              <div className={styles.successMessage}>
                <h3>Thank You!</h3>
                <p>Your message has been sent. We&apos;ll get back to you shortly.</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <div className={styles.textareaGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    placeholder="How can we help?"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button variant="primary" fullWidth type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
          <div className={styles.infoContainer}>
            <h3>Contact Information</h3>
            <p>For support or general inquiries, please email us at your convenience. We aim to respond to all queries within 24 hours.</p>
            <a href="mailto:support@megilance.com" className={styles.emailLink}>support@megilance.com</a>
            {/* Social links can be added here later */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
