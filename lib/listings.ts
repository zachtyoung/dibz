import type { City } from "@/lib/cities";
import { getCityBySlug } from "@/lib/cities";

export type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  distance: string;
  seller: string;
  image: string;
  lat: number;
  lng: number;
  isGarageSale?: boolean;
  description?: string;
  date?: string;
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?w=800&h=800&fit=crop&auto=format&q=70`;

const TEMPLATES: (Omit<Listing, "lat" | "lng" | "distance"> & { dLat: number; dLng: number })[] = [
  { id: "1",  title: "Vintage Leather Armchair",           price: 240,  category: "Furniture",   location: "your neighborhood", seller: "Maya R.",         image: img("photo-1567538096630-e0c55bd6374c"), dLat: -0.010, dLng:  0.016, description: "Worn-in mid-century chair. Smoke free home." },
  { id: "2",  title: "Trek Mountain Bike — Size M",        price: 380,  category: "Sports",      location: "nearby",            seller: "Jordan K.",       image: img("photo-1532298229144-0ec0c57515c7"), dLat: -0.027, dLng:  0.011 },
  { id: "3",  title: "Neighborhood Garage Sale — Sat 9am", price: 0,    category: "Garage Sale", location: "down the street",   seller: "Elm St Neighbors",image: img("photo-1611348586804-61bf6c080437"), dLat: -0.020, dLng: -0.015, isGarageSale: true, description: "8 households. Furniture, kids' toys, kitchenware, vinyl records, plants. Cash + Venmo.", date: "Sat, Jun 8 · 9am–3pm" },
  { id: "4",  title: 'MacBook Pro 14" M2 — Like New',      price: 1450, category: "Electronics", location: "nearby",            seller: "Devon L.",        image: img("photo-1517336714731-489689fd1ca8"), dLat:  0.009, dLng:  0.025 },
  { id: "5",  title: "IKEA Kallax Shelf — White",          price: 60,   category: "Furniture",   location: "your area",         seller: "Priya S.",        image: img("photo-1505691938895-1758d7feb511"), dLat:  0.007, dLng: -0.009 },
  { id: "6",  title: "Estate Sale — 3 Generations",        price: 0,    category: "Garage Sale", location: "nearby block",      seller: "The Chen Family", image: img("photo-1493663284031-b7e3aefcae8e"), dLat: -0.014, dLng: -0.064, isGarageSale: true, description: "Antique furniture, china, jewelry, books, tools, mid-century lamps. Early birds welcome.", date: "Sun, Jun 9 · 8am–2pm" },
  { id: "7",  title: "Canon EOS R6 + 24-105mm",            price: 1800, category: "Electronics", location: "nearby",            seller: "Sam T.",          image: img("photo-1502920917128-1aa500764cbd"), dLat:  0.033, dLng: -0.007 },
  { id: "8",  title: "Designer Lamp — Brass",              price: 95,   category: "Home",        location: "your neighborhood", seller: "Renee F.",        image: img("photo-1507473885765-e6ed057f782c"), dLat: -0.009, dLng: -0.005 },
  { id: "9",  title: "Patagonia Down Jacket — M",          price: 85,   category: "Clothing",    location: "nearby",            seller: "Alex M.",         image: img("photo-1551028719-00167b16eac5"), dLat:  0.011, dLng: -0.034 },
  { id: "10", title: "Block Party Garage Sale — Multi-Family", price: 0, category: "Garage Sale", location: "2 blocks away",   seller: "20th St Block",   image: img("photo-1528837516156-0a2c2c1d3e76"), dLat: -0.010, dLng:  0.030, isGarageSale: true, description: "12+ homes participating. Maps at the corner. Live music + lemonade stand.", date: "Sat, Jun 15 · 10am–4pm" },
  { id: "11", title: "Mid-Century Walnut Dresser",         price: 520,  category: "Furniture",   location: "nearby",            seller: "Hana O.",         image: img("photo-1556228720-195a672e8a03"), dLat:  0.023, dLng: -0.008 },
  { id: "12", title: "Vinyl Record Collection — 200+",     price: 320,  category: "Music",       location: "your area",         seller: "Marcus B.",       image: img("photo-1483412033650-1015ddeb83d1"), dLat:  0.002, dLng: -0.001 },
];

function distanceMi(dLat: number, dLng: number): string {
  const m = Math.sqrt((dLat * 111_000) ** 2 + (dLng * 111_000 * Math.cos(0.65)) ** 2);
  return (m / 1609).toFixed(1) + " mi";
}

export function getListings(city: City): Listing[] {
  return TEMPLATES.map(({ dLat, dLng, ...t }) => ({
    ...t,
    lat: city.lat + dLat,
    lng: city.lng + dLng,
    distance: distanceMi(dLat, dLng),
  }));
}

const SF_CITY = getCityBySlug("san-francisco-ca")!;
export const LISTINGS = getListings(SF_CITY);

export const CATEGORIES = ["All", "Garage Sale", "Furniture", "Electronics", "Home", "Clothing", "Sports", "Music"];
