import PostProjectClient from './PostProjectClient';

const faqs = [
  { question: "Is it really free to post?", answer: "Yes. Posting projects on MegiLance is completely free with no hidden fees." },
  { question: "How fast will I get proposals?", answer: "Most projects receive proposals within 1-2 hours thanks to AI-powered matching." },
  { question: "What if I'm not satisfied?", answer: "Our escrow system protects your payment. If work doesn't meet milestones, you can request revisions or escalate to dispute resolution." },
];

export default function PostProjectPage() {
  return <PostProjectClient faqs={faqs} />;
}
