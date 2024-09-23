import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

interface RecaptchaResponseData {
  statusCode: number;
  success: boolean;
  score: number;
  error?: string;
}

interface GoogleVerify {
  success: boolean;
  score: number;
}

interface PostData {
  gRecaptchaToken: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<RecaptchaResponseData>> {
  if (request.method !== 'POST') {
    return NextResponse.json(
      {
        statusCode: 405,
        success: false,
        error: 'Only post requests allowed',
      },
      { status: 405 },
    );
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      {
        statusCode: 500,
        success: false,
        error: 'Server configuration error',
      },
      { status: 500 },
    );
  }

  let postData: PostData;
  try {
    postData = await request.json();
  } catch (error: unknown) {
    return NextResponse.json(
      {
        statusCode: 400,
        success: false,
        error: 'Bad request',
      },
      { status: 400 },
    );
  }

  const { gRecaptchaToken } = postData;

  const formData = `secret=${secretKey}&response=${gRecaptchaToken}`;

  try {
    const response = await axios.post<GoogleVerify>(
      `https://www.google.com/recaptcha/api/siteverify`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (response.data.success && response.data.score > 0.5) {
      return NextResponse.json(
        {
          statusCode: 200,
          success: true,
          score: response.data.score,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        statusCode: 403,
        success: false,
        error: 'ReCaptcha verification failed',
      },
      { status: 403 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        statusCode: 500,
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
