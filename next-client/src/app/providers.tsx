"use client";

import React, { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import HeaderComponent from "@/components/header-component/HeaderComponent";
import { Playfair_Display, Imperial_Script, Roboto } from "next/font/google";
import { UserProvider} from "./contexts/UserProvider";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  style: ["italic"],
  variable: "--font-playfair",
  display: "swap",
});

const imperialScript = Imperial_Script({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  variable: "--font-imperial",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  style: ["normal"],
  variable: "--font-roboto",
  display: "swap",
});

export function Providers({
  children,} : { children: React.ReactNode; }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <SessionProvider>
          <UserProvider>
              <Suspense fallback={
                  <div style={{marginTop: '20px'}}>
                      <LoaderComponent/>
                  </div>
              }>
                  <div className={`${playfair.variable} ${imperialScript.variable} ${roboto.variable}`}>
              <HeaderComponent />
              {children}
            </div>
          </Suspense>
        </UserProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}