import request from 'supertest';
import app from '../app';
import { userStore } from '../routes/v1/auth';

beforeEach(() => {
  userStore.clear();
});

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';
const ME_URL = '/api/v1/auth/me';

const VALID_SELLER = {
  name: 'Ada Okafor',
  email: 'ada@tradegrid.africa',
  password: 'Secure1234!',
  role: 'seller',
};

const VALID_BUYER = {
  name: 'Emeka Eze',
  email: 'emeka@tradegrid.africa',
  password: 'Password99!',
  role: 'buyer',
};

describe('POST /api/v1/auth/register', () => {
  it('creates a user and returns a JWT', async () => {
    const res = await request(app).post(REGISTER_URL).send(VALID_SELLER);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.email).toBe(VALID_SELLER.email);
  });

  it('rejects duplicate email with 409', async () => {
    await request(app).post(REGISTER_URL).send(VALID_SELLER);
    const res = await request(app).post(REGISTER_URL).send(VALID_SELLER);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_IN_USE');
  });

  it('rejects missing fields with 400', async () => {
    const res = await request(app).post(REGISTER_URL).send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ ...VALID_SELLER, password: 'short' });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid email with 400', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ ...VALID_SELLER, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_URL).send(VALID_SELLER);
  });

  it('returns a token with valid credentials', async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: VALID_SELLER.email, password: VALID_SELLER.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: VALID_SELLER.email, password: 'WrongPass1!' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: 'nobody@tradegrid.africa', password: VALID_SELLER.password });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  let token: string;

  beforeEach(async () => {
    const res = await request(app).post(REGISTER_URL).send(VALID_BUYER);
    token = res.body.data.token;
  });

  it('returns the current user with a valid token', async () => {
    const res = await request(app).get(ME_URL).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(VALID_BUYER.email);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get(ME_URL);
    expect(res.status).toBe(401);
  });

  it('returns 401 with a bad token', async () => {
    const res = await request(app).get(ME_URL).set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
