import { Listing } from '../lib/api';
import { formatCurrency } from '@tradegrid/utils';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="listing-card">
      <div className="listing-card__image-placeholder" aria-hidden="true">
        {listing.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrls[0]} alt={listing.title} />
        ) : (
          <span>📦</span>
        )}
      </div>
      <div className="listing-card__body">
        <span className="listing-card__badge">{listing.condition}</span>
        <h2 className="listing-card__title">{listing.title}</h2>
        <p className="listing-card__location">📍 {listing.location}</p>
        <p className="listing-card__price">{formatCurrency(listing.price, listing.currency)}</p>
        <p className="listing-card__category">{listing.category}</p>
      </div>
    </article>
  );
}

export default ListingCard;
