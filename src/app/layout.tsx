import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "./fonts/cormorant-garamond-latin.woff2",
  weight: "300 700",
  style: "normal",
  fallback: ["Georgia"],
  adjustFontFallback: "Times New Roman",
  variable: "--font-display",
  display: "swap",
});
const sans = localFont({
  src: "./fonts/manrope-latin.woff2",
  weight: "200 800",
  style: "normal",
  fallback: ["Arial"],
  variable: "--font-body",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
