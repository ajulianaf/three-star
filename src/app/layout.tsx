import "./globals.css";
import type { ReactNode } from "react";
import { Itim, Almendra_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";
import { CartProvider } from "@/context/CartContext";

const itim = Itim({ subsets: ["latin"], weight: "400", variable: "--font-itim" });
const gothic = Almendra_Display({ subsets: ["latin"], weight: "400", variable: "--font-gothic" });

export const metadata = { title: "Three Star", description: "Producciones y merchandising oficial" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${itim.variable} ${gothic.variable} font-sans`}>
        <CartProvider>
          <SplashScreen />
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}