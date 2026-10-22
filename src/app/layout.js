import Script from "next/script";
import AppChrome from "../components/AppChrome";
import "./globals.css";

export const metadata = {
  title: "BookTheSlot — Appointments on your time",
  description:
    "Find local businesses, choose an available time, and book your next appointment.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className="app-shell">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
