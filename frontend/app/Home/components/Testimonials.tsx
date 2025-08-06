import React from 'react';
import commonStyles from './Testimonials.common.module.css';
import lightStyles from './Testimonials.light.module.css';
import darkStyles from './Testimonials.dark.module.css';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// @AI-HINT: Testimonials section. Now fully theme-switchable using global theme context.

const testimonials = [
  {
    quote: 'MegiLance has revolutionized the way I work. The AI tools are a game-changer, and the secure payment system gives me peace of mind.',
    author: 'Alexia C.',
    title: 'Senior Frontend Developer',
    avatar: '/avatars/alexia.jpg',
  },
  {
    quote: 'As a client, finding top talent has never been easier. The platform is intuitive, and the quality of freelancers is outstanding.',
    author: 'John D.',
    title: 'Startup Founder',
    avatar: '/avatars/john.jpg',
  },
  {
    quote: 'The instant USDC payments are incredible. No more waiting for bank transfers or dealing with high fees. This is the future!',
    author: 'Maria S.',
    title: 'UX/UI Designer',
    avatar: '/avatars/maria.jpg',
  },
];

const Testimonials: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.testimonials, themeStyles.testimonials)}>
      <div className={commonStyles.container}>
        <h2 className={commonStyles.sectionTitle}>Loved by Freelancers & Clients</h2>
        <div className={commonStyles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={cn(commonStyles.testimonialCard, themeStyles.testimonialCard)}>
              <p className={cn(commonStyles.testimonialQuote, themeStyles.testimonialQuote)}>"{testimonial.quote}"</p>
              <div className={commonStyles.testimonialAuthor}>
                <img src={testimonial.avatar} alt={testimonial.author} className={commonStyles.authorAvatar} />
                <div className={commonStyles.authorInfo}>
                  <p className={cn(commonStyles.authorName, themeStyles.authorName)}>{testimonial.author}</p>
                  <p className={cn(commonStyles.authorTitle, themeStyles.authorTitle)}>{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
