import { Geist, Baloo_2 } from "next/font/google";
import "./globals.css";

const bodyFont = Geist({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = Baloo_2({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"]
});

export const metadata = {
  title: "Notas de voz QR",
  description: "Notas de voz escolares con audio en R2 y escucha por QR."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
