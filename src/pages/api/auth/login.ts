import redis from '@umami/redis-client';
import { saveAuth } from 'lib/auth';
import { secret } from 'lib/crypto';
import { useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, User } from 'lib/types';
import { NextApiResponse } from 'next';
import {
  checkPassword,
  createSecureToken,
  forbidden,
  methodNotAllowed,
  ok,
  unauthorized,
} from 'next-basics';
import { getUserByUsername } from 'queries';
import * as yup from 'yup';
import { ROLES } from 'lib/constants';

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const schema = {
  POST: yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
  }),
};

const rateLimitMap = new Map();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour window in milliseconds
const RATE_LIMIT_MAX_ATTEMPTS = 5; // Allow 5 attempts per window

function rateLimiter(ip: string) {
  const currentTime = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, firstRequest: currentTime });
    return true;
  }

  const { count, firstRequest } = rateLimitMap.get(ip);

  if (currentTime - firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, firstRequest: currentTime });
    return true;
  }

  if (count < RATE_LIMIT_MAX_ATTEMPTS) {
    rateLimitMap.set(ip, { count: count + 1, firstRequest });
    return true;
  }

  return false;
}

export default async (
  req: NextApiRequestQueryBody<any, LoginRequestBody>,
  res: NextApiResponse<LoginResponse>,
) => {
  if (process.env.DISABLE_LOGIN) {
    return forbidden(res);
  }

  await useValidate(schema, req, res);

  if (req.method === 'POST') {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Apply rate limiter
    if (!rateLimiter(clientIP)) {
      return res.status(429).json({ message: 'Too many requests. Try again later.' });
    }

    const { username, password } = req.body;

    const user = await getUserByUsername(username, { includePassword: true });

    if (user && checkPassword(password, user.password)) {
      if (redis.enabled) {
        const token = await saveAuth({ userId: user.id });

        return ok(res, { token, user });
      }

      const token = createSecureToken({ userId: user.id }, secret());
      const { id, username, role, createdAt } = user;

      return ok(res, {
        token,
        user: { id, username, role, createdAt, isAdmin: role === ROLES.admin },
      });
    }

    return unauthorized(res, 'message.incorrect-username-password');
  }

  return methodNotAllowed(res);
};
