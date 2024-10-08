// 'use client';

import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  PasswordField,
  SubmitButton,
  Icon,
} from 'react-basics';
import { useRouter } from 'next/navigation';
import { useApi, useMessages } from 'components/hooks';
import { setUser } from 'store/app';
import { setClientAuthToken } from 'lib/client';
import Logo from 'assets/cilegon.svg';
import styles from './LoginForm.module.css';

// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// import axios from 'axios';
// import { useState } from 'react';

export function LoginForm() {
  // const { executeRecaptcha } = useGoogleReCaptcha();
  // const [errorCaptcha, setErrorCaptcha] = useState<string>('');

  const { formatMessage, labels, getMessage } = useMessages();
  const router = useRouter();
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post('/auth/login', data),
  });

  const handleSubmit = async (data: any) => {
    // setErrorCaptcha('');

    // if (!executeRecaptcha) {
    //   // eslint-disable-next-line no-console
    //   console.log('ReCAPTCHA not available');
    //   return;
    // }

    // const gRecaptchaToken = await executeRecaptcha('loginSubmit');

    // try {
    //   const response = await axios.post(
    //     '/api/recaptchaVerify',
    //     {
    //       gRecaptchaToken,
    //     },
    //     {
    //       headers: {
    //         Accept: 'application/json, text/plain, */*',
    //         'Content-Type': 'application/json',
    //       },
    //     },
    //   );

    //   if (!response.data.success) {
    //     setErrorCaptcha('Login Failed. Please try again.');
    //   }
    // } catch (error) {
    //   setErrorCaptcha('An error occurred. Please try again.');
    // }

    mutate(data, {
      onSuccess: async ({ token, user }) => {
        setClientAuthToken(token);
        setUser(user);

        router.push('/dashboard');
      },
    });
  };

  return (
    <div className={styles.login}>
      <Icon className={styles.icon} size="xl">
        <Logo />
      </Icon>
      <div className={styles.title}>Analitik Cilegon</div>
      <Form
        className={styles.form}
        onSubmit={handleSubmit}
        error={getMessage(error)}
        preventSubmit={true}
      >
        <FormRow label={formatMessage(labels.username)}>
          <FormInput
            data-test="input-username"
            name="username"
            rules={{ required: formatMessage(labels.required) }}
          >
            <TextField autoComplete="off" />
          </FormInput>
        </FormRow>
        <FormRow label={formatMessage(labels.password)}>
          <FormInput
            data-test="input-password"
            name="password"
            rules={{ required: formatMessage(labels.required) }}
          >
            <PasswordField />
          </FormInput>
        </FormRow>
        <FormButtons>
          <SubmitButton
            data-test="button-submit"
            className={styles.button}
            variant="primary"
            disabled={isPending}
          >
            {formatMessage(labels.login)}
          </SubmitButton>
        </FormButtons>
      </Form>
    </div>
  );
}

export default LoginForm;
