import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { RealtimeProvider } from '@/context/RealtimeContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'AICTE IDEA LAB | Tulsiramji Gaikwad Patil College of Engineering & Technology',
  description: 'Official Platform for AICTE IDEA LAB TGPCET Nagpur. Prototyping, 3D Printing, IoT PCB, Robotics, Laser Cutting, and Student Innovation Chapter.',
  keywords: ['AICTE', 'IDEA LAB', 'TGPCET', 'Nagpur', '3D Printing', 'Robotics', 'IoT PCB', 'CNC', 'Darshan', 'Dr. Neeraj Waijode'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AICTE IDEA LAB',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('idea_lab_theme');
                  var prefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased relative selection:bg-cyan-500 selection:text-white pb-16 md:pb-0">
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sky-500/15 via-cyan-500/10 to-transparent blur-[120px] rounded-full" />
          <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full" />
          <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-cyan-600/10 blur-[140px] rounded-full" />
        </div>
        <ThemeProvider>
          <AuthProvider>
            <RealtimeProvider>
              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </main>
              <BottomNav />
              <Footer />
            </RealtimeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
