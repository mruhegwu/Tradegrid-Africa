const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  status: 'active' | 'sold' | 'draft';
  location: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListingsResponse {
  status: string;
  data: Listing[];
  pagination: Pagination;
}

export async function fetchListings(
  params: Record<string, string | number> = {}
): Promise<ListingsResponse> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();

  const res = await fetch(`${API_BASE}/api/v1/listings${qs ? `?${qs}` : ''}`, {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch listings: ${res.statusText}`);
  }

  return res.json() as Promise<ListingsResponse>;
}

export async function fetchListing(id: string): Promise<Listing> {
  const res = await fetch(`${API_BASE}/api/v1/listings/${id}`, {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`Listing not found: ${res.statusText}`);
  }

  const json = (await res.json()) as { status: string; data: Listing };
  return json.data;
}
