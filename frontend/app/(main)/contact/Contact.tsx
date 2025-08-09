// @AI-HINT: Premium Contact page: validated form, a11y, theme-aware styles, and animated entry.
'use client';
import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './Contact.common.module.css';
import light from './Contact.light.module.css';
import dark from './Contact.dark.module.css';

function useInView<T extends HTMLElement>(opts: IntersectionObserverInit = { threshold: 0.15 }) {
  const ref = React.useRef<T | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;
    const ob = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        ob.disconnect();
      }
    }, opts);
    ob.observe(ref.current);
    return () => ob.disconnect();
  }, [opts]);
  return { ref, visible } as const;
}

const Contact: React.FC = () => {
  const { theme } = useTheme();
  const t = theme === 'dark' ? dark : light;
  const styles = {
    root: cn(common.root, t.root),
    header: cn(common.header, t.header),
    subtitle: cn(common.subtitle, t.subtitle),
    grid: cn(common.grid, t.grid),
    card: cn(common.card, t.card),
    label: cn(common.label, t.label),
    input: cn(common.input, t.input),
    select: cn(common.select, t.select),
    textarea: cn(common.textarea, t.textarea),
    error: cn(common.error, t.error),
    submit: cn(common.submit, t.submit),
    fadeIn: cn(common.fadeIn, t.fadeIn),
    visible: cn(common.visible, t.visible),
  };

  const { ref: headerRef, visible: headerVisible } = useInView<HTMLDivElement>();
  const { ref: formRef, visible: formVisible } = useInView<HTMLDivElement>({ threshold: 0.2 });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [sent, setSent] = React.useState<null | 'ok' | 'err'>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const topic = String(fd.get('topic') || '').trim();
    const message = String(fd.get('message') || '').trim();

    const errs: Record<string, string> = {};
    if (!name) errs.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!topic) errs.topic = 'Please select a topic.';
    if (message.length < 10) errs.message = 'Message must be at least 10 characters.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Frontend-only stub. Hook to CRM or API in backend phase.
    setTimeout(() => setSent('ok'), 400);
    e.currentTarget.reset();
  }

  return (
    <section className={styles.root} aria-labelledby="contact-title">
      <div ref={headerRef} className={cn(styles.header, styles.fadeIn, headerVisible && styles.visible)}>
        <h1 id="contact-title">Contact Us</h1>
        <p className={styles.subtitle}>We usually respond within one business day.</p>
      </div>

      <div ref={formRef} className={cn(styles.grid, styles.fadeIn, formVisible && styles.visible)}>
        <form className={styles.card} aria-describedby="contact-note" noValidate onSubmit={handleSubmit}>
          <div>
            <label className={styles.label} htmlFor="name">Name</label>
            <input className={styles.input} id="name" name="name" type="text" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'error-name' : undefined} />
            {errors.name && <div id="error-name" className={styles.error} role="alert">{errors.name}</div>}
          </div>
          <div>
            <label className={styles.label} htmlFor="email">Email</label>
            <input className={styles.input} id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'error-email' : undefined} />
            {errors.email && <div id="error-email" className={styles.error} role="alert">{errors.email}</div>}
          </div>
          <div>
            <label className={styles.label} htmlFor="topic">Topic</label>
            <select className={styles.select} id="topic" name="topic" defaultValue="" aria-invalid={!!errors.topic} aria-describedby={errors.topic ? 'error-topic' : undefined}>
              <option value="" disabled>Choose a topic</option>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
              <option value="partnerships">Partnerships</option>
            </select>
            {errors.topic && <div id="error-topic" className={styles.error} role="alert">{errors.topic}</div>}
          </div>
          <div>
            <label className={styles.label} htmlFor="message">Message</label>
            <textarea className={styles.textarea} id="message" name="message" rows={5} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'error-message' : undefined} />
            {errors.message && <div id="error-message" className={styles.error} role="alert">{errors.message}</div>}
          </div>
          <button className={styles.submit} type="submit">Send</button>
          <p id="contact-note" aria-live="polite">
            {sent === 'ok' ? 'Thanks! Your message has been sent.' : sent === 'err' ? 'Something went wrong. Please try again.' : ''}
          </p>
        </form>
      </div>
    </section>
  );
};

export default Contact;
