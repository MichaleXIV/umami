// 'use client';

import { Metadata } from 'next';
import LoginPage from './LoginPage';

// import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// function RecaptchaProvider({ children }: { children: React.ReactNode }) {
//   const recaptchaKey: string | undefined = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

//   return (
//     <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey ?? 'NOT DEFINED'}>
//       {children}
//     </GoogleReCaptchaProvider>
//   );
// }

export default async function () {
  return (
    // <RecaptchaProvider>
    <LoginPage />
    // </RecaptchaProvider>
  );
}

export const metadata: Metadata = {
  title: 'Login',
};
