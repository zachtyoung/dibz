import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getListingByIdFromDB, getListingsFromDB } from "@/lib/db";
import { ListingClient } from "./ListingClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingByIdFromDB(id);
  if (!listing) return { title: "Listing not found — Dibz" };

  const price = listing.isGarageSale ? "Free entry" : `$${listing.price.toLocaleString()}`;
  const description = listing.description
    ? `${price} · ${listing.description.slice(0, 140)}`
    : `${price} · ${listing.category} for sale in ${listing.location} on Dibz.`;

  return {
    title: `${listing.title} — ${price} | Dibz`,
    description,
    openGraph: {
      title: `${listing.title} — ${price}`,
      description,
      images: [{ url: listing.image, width: 800, height: 800, alt: listing.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${listing.title} — ${price}`,
      description,
      images: [listing.image],
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListingByIdFromDB(id);
  if (!listing) notFound();

  const cityListings = await getListingsFromDB(listing.location.toLowerCase().replace(/\s+/g, "-"));
  const related = cityListings
    .filter((l) => l.id !== id)
    .sort((a, b) => (a.category === listing.category ? -1 : 1) - (b.category === listing.category ? -1 : 1))
    .slice(0, 4);

  const isGarageSale = listing.isGarageSale;
  const price = isGarageSale ? 0 : listing.price;
  const availability = "https://schema.org/InStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isGarageSale ? "Event" : "Product",
    ...(isGarageSale
      ? {
          name: listing.title,
          description: listing.description,
          image: listing.image,
          location: {
            "@type": "Place",
            name: listing.location,
            geo: { "@type": "GeoCoordinates", latitude: listing.lat, longitude: listing.lng },
          },
          ...(listing.date ? { startDate: listing.date } : {}),
          organizer: { "@type": "Person", name: listing.seller },
          isAccessibleForFree: true,
        }
      : {
          name: listing.title,
          description: listing.description,
          image: listing.image,
          category: listing.category,
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: "USD",
            availability,
            seller: { "@type": "Person", name: listing.seller },
            areaServed: {
              "@type": "GeoCircle",
              geoMidpoint: { "@type": "GeoCoordinates", latitude: listing.lat, longitude: listing.lng },
              geoRadius: "10000",
            },
          },
        }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListingClient listing={listing} related={related} />
    </>
  );
}
