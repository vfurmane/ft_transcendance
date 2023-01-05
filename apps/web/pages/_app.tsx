import localFont from "@next/font/local";
import { AppProps } from "next/app";
import { ReactElement } from "react";

const interFont = localFont({ src: "../assets/Inter-Regular.ttf" });

export default function MyApp({
  Component,
  pageProps,
}: AppProps): ReactElement {
  return (
    <main className={interFont.className}>
      <Component {...pageProps} />
    </main>
  );
}
