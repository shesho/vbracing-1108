import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dev Notes',
  description: 'Decentralized developer notes inspired by John Carmack',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header>
            <h1>{'>'} DEV.NOTES</h1>
            <p className="subtitle">A decentralized development log</p>
          </header>
          <main>{children}</main>
          <footer>
            <p>Part of the decentralized dev notes network</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

