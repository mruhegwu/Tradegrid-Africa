import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { fetchListings, Listing, Pagination } from '../lib/api';
import { ListingCard } from '../components/ListingCard';

interface ListingsPageProps {
  listings: Listing[];
  pagination: Pagination;
  error?: string;
}

export default function ListingsPage({ listings, pagination, error }: ListingsPageProps) {
  return (
    <>
      <Head>
        <title>Browse Listings – Tradegrid Africa</title>
        <meta
          name="description"
          content="Discover products from sellers across Africa on Tradegrid."
        />
      </Head>
      <main className="listings-page">
        <header className="listings-page__header">
          <h1>Browse Listings</h1>
          <p>
            {pagination.total} item{pagination.total !== 1 ? 's' : ''} available
          </p>
        </header>

        {error && (
          <div className="listings-page__error" role="alert">
            <p>⚠️ {error}</p>
          </div>
        )}

        {!error && listings.length === 0 && (
          <p className="listings-page__empty">No listings found. Check back soon!</p>
        )}

        <div className="listings-grid">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {pagination.totalPages > 1 && (
          <nav className="listings-page__pagination" aria-label="Pagination">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </nav>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ListingsPageProps> = async () => {
  try {
    const data = await fetchListings({ page: 1, limit: 20 });
    return {
      props: {
        listings: data.data,
        pagination: data.pagination,
      },
    };
  } catch {
    return {
      props: {
        listings: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        error: 'Unable to load listings right now. Please try again later.',
      },
    };
  }
};
