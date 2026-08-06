import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AICTE IDEA LAB | Tulsiramji Gaikwad Patil College of Engineering & Technology',
  description: 'Official Platform for AICTE IDEA LAB TGPCET Nagpur. Prototyping, 3D Printing, IoT PCB, Robotics, Laser Cutting, and Student Innovation Chapter.',
  keywords: ['AICTE', 'IDEA LAB', 'TGPCET', 'Nagpur', '3D Printing', 'Robotics', 'IoT PCB', 'CNC', 'Darshan', 'Dr. Neeraj Waijode'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
