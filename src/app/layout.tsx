import { Metadata } from 'next';
import Providers from './Providers';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import 'react-basics/dist/styles.css';
import 'styles/locale.css';
import 'styles/index.css';
import 'styles/variables.css';

import Script from 'next/script';
import { headers } from 'next/headers';

export default function ({ children }) {
  const headerList = headers();
  const nonce = headerList.get('x-nonce') || '';

  return (
    <html lang="en" data-scroll="0">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/static/android-48x48.png" />
        <link rel="icon" type="image/png" sizes="36x36" href="/static/android-36x36.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#2f2f2f" media="(prefers-color-scheme: dark)" />
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>
        <Script id="nonce" nonce={nonce}></Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: {
    template: '%s | Analitik Cilegon',
    default: 'Analitik Cilegon',
  },
};
