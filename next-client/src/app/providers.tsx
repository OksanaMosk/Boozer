"use client";

import React, { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import HeaderComponent from "@/components/header-component/HeaderComponent";
import { UserProvider} from "./contexts/UserProvider";



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
                  <div>
              <HeaderComponent />
              {children}
            </div>
          </Suspense>
        </UserProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}