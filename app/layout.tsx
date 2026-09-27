import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthProvider";
import "./globals.css";
import { ThemeProvider } from "next-themes";


const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#D07D50",
};

export const metadata: Metadata = {
  title: {
    default: "Cosmara | Premium Car Hire in Nairobi, Kenya",
    template: "%s | Cosmara Car Hire",
  },
  description:
    "Cosmara offers premium car hire in Nairobi and across Kenya. Compact, executive, SUV, luxury, safari and wedding vehicles available. Book online or via WhatsApp.",
  keywords: [
    "car hire Nairobi",
    "car rental Kenya",
    "luxury car hire Nairobi",
    "SUV hire Nairobi",
    "safari car hire Kenya",
    "wedding car hire Nairobi",
    "Cosmara car hire",
    "airport car hire Nairobi",
    "JKIA car hire",
    "premium car hire Nairobi",
    "car rental Nairobi",
    "car hire Nairobi Kenya",
    "car hire Kenya",
    "car hire and tours Nairobi",
  ],
  metadataBase: new URL("https://cosmara.co.ke"),
  openGraph: {
    title: "Cosmara | Premium Car Hire in Nairobi",
    description:
      "Book premium cars in Nairobi. Executive, SUV, safari and wedding vehicles available.",
    url: "https://cosmara.co.ke",
    siteName: "Cosmara",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmara | Premium Car Hire in Nairobi",
    description: "Book premium cars in Nairobi, Kenya.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.className} antialiased min-h-full`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
