import { Geist, Geist_Mono } from "next/font/google";
import { ServerProvider } from "./context/ServerContext";
import { AuthProvider } from "./context/AuthContext";
import { ServerGroupProvider } from "./context/ServerGroupContext";
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import "./darkTheme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Server Rack",
  description: "Manage servers, applications, and ports",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
        suppressHydrationWarning
      >        <AuthProvider>
          <ServerProvider>
            <ServerGroupProvider>
              <Suspense>
                {children}
              </Suspense>
              <Toaster position="bottom-right" toastOptions={{
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }} />
            </ServerGroupProvider>
          </ServerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
