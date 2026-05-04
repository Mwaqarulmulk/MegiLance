import { PageTransition } from './components/Animations/PageTransition';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
}
