import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

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
            <div className="header-content">
              <div>
                <h1>
                  <Link href="/">{'>'} DEV.NOTES</Link>
                </h1>
                <p className="subtitle">A decentralized development log</p>
              </div>
              <nav className="header-nav">
                <Link href="/">My Notes</Link>
                <Link href="/feed">Federation</Link>
                <Link href="/manage">Manage</Link>
              </nav>
            </div>
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

