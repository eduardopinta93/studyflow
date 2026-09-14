import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Footer from './components/Footer';
import Header from './components/Header';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StudyFlow',
  description: 'A student task and course manager',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
