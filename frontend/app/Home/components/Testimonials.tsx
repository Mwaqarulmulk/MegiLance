import React from 'react';
import './Testimonials.common.css';

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

interface TestimonialsProps { theme?: "light" | "dark"; }
const Testimonials: React.FC<TestimonialsProps> = ({ theme = "light" }) => {
  return (
    <section className={`Testimonials theme-${theme}`}>
      <div className="Home-container">
        <h2 className="Home-section-title">Loved by Freelancers & Clients</h2>
        <div className="Home-testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="Home-testimonial-card">
              <p className="Home-testimonial-quote">"{testimonial.quote}"</p>
              <div className="Home-testimonial-author">
                <img src={testimonial.avatar} alt={testimonial.author} className="Home-author-avatar" />
                <div className="Home-author-info">
                  <p className="Home-author-name">{testimonial.author}</p>
                  <p className="Home-author-title">{testimonial.title}</p>
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
