import request from 'supertest';
import app from '../app';
import { userStore } from '../routes/v1/auth';
import { listingStore } from '../routes/v1/listings';

const REGISTER_URL = '/api/v1/auth/register';
const LISTINGS_URL = '/api/v1/listings';

const SELLER = {
  name: 'Chidi Seller',
  email: 'chidi@tradegrid.africa',
  password: 'Password99!',
  role: 'seller',
};

const BUYER = {
  name: 'Ngozi Buyer',
  email: 'ngozi@tradegrid.africa',
  password: 'Password99!',
  role: 'buyer',
};

const VALID_LISTING = {
  title: 'Nigerian Hand-Woven Kente Cloth',
  description: 'Beautiful hand-woven Kente fabric sourced from Aso-Oke artisans in Oyo State.',
  price: 25000,
  currency: 'NGN',
  category: 'Textiles',
  condition: 'new',
  location: 'Lagos, Nigeria',
  imageUrls: [],
};

async function getToken(user: typeof SELLER | typeof BUYER) {
  const res = await request(app).post(REGISTER_URL).send(user);
  return res.body.data.token as string;
}

beforeEach(() => {
  userStore.clear();
  listingStore.clear();
});

describe('GET /api/v1/listings', () => {
  it('returns an empty array when no listings exist', async () => {
    const res = await request(app).get(LISTINGS_URL);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('returns paginated listings', async () => {
    const token = await getToken(SELLER);
    await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LISTING);
    await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LISTING, title: 'Second listing' });

    const res = await request(app).get(`${LISTINGS_URL}?page=1&limit=1`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('filters by category', async () => {
    const token = await getToken(SELLER);
    await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LISTING);
    await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LISTING, title: 'Electronics item', category: 'Electronics' });

    const res = await request(app).get(`${LISTINGS_URL}?category=Textiles`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((l: { category: string }) => l.category === 'Textiles')).toBe(true);
  });

  it('filters by price range', async () => {
    const token = await getToken(SELLER);
    await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LISTING, price: 5000 });
    await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LISTING, price: 100000, title: 'Expensive item' });

    const res = await request(app).get(`${LISTINGS_URL}?maxPrice=10000`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((l: { price: number }) => l.price <= 10000)).toBe(true);
  });

  it('supports text search', async () => {
    const token = await getToken(SELLER);
    await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LISTING);
    await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...VALID_LISTING,
        title: 'Unique Batik Scarf',
        description: 'Handmade batik scarf made with adire technique from Osun State.',
      });

    const res = await request(app).get(`${LISTINGS_URL}?search=batik`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Unique Batik Scarf');
  });
});

describe('GET /api/v1/listings/:id', () => {
  it('returns a listing by ID', async () => {
    const token = await getToken(SELLER);
    const created = await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LISTING);
    const id = created.body.data.id;

    const res = await request(app).get(`${LISTINGS_URL}/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('returns 404 for unknown ID', async () => {
    const res = await request(app).get(`${LISTINGS_URL}/non-existent-id`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/v1/listings', () => {
  it('allows a seller to create a listing', async () => {
    const token = await getToken(SELLER);
    const res = await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LISTING);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe(VALID_LISTING.title);
    expect(res.body.data.status).toBe('active');
  });

  it('blocks a buyer from creating a listing', async () => {
    const token = await getToken(BUYER);
    const res = await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LISTING);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post(LISTINGS_URL).send(VALID_LISTING);
    expect(res.status).toBe(401);
  });

  it('rejects invalid listing data', async () => {
    const token = await getToken(SELLER);
    const res = await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No' }); // too short, missing required fields
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('PATCH /api/v1/listings/:id', () => {
  it('allows the owner to update their listing', async () => {
    const token = await getToken(SELLER);
    const created = await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LISTING);
    const id = created.body.data.id;

    const res = await request(app)
      .patch(`${LISTINGS_URL}/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 20000 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(20000);
  });

  it("prevents another seller from editing someone else's listing", async () => {
    const ownerToken = await getToken(SELLER);
    const otherSeller = { ...SELLER, email: 'other@tradegrid.africa', name: 'Other Seller' };
    const otherToken = await getToken(otherSeller);

    const created = await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(VALID_LISTING);
    const id = created.body.data.id;

    const res = await request(app)
      .patch(`${LISTINGS_URL}/${id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ price: 1 });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/v1/listings/:id', () => {
  it('soft-deletes a listing for a seller (sets status to sold)', async () => {
    const token = await getToken(SELLER);
    const created = await request(app)
      .post(LISTINGS_URL)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LISTING);
    const id = created.body.data.id;

    const res = await request(app)
      .delete(`${LISTINGS_URL}/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('sold');
  });

  it('returns 404 for non-existent listing', async () => {
    const token = await getToken(SELLER);
    const res = await request(app)
      .delete(`${LISTINGS_URL}/does-not-exist`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
