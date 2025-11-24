// components/ThemeProvider.tsx
"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export type ThemeProviderProps = React.ComponentProps<
  typeof NextThemesProvider
>;

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    // attribute controls whether next-themes writes data-theme or class on <html>
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
