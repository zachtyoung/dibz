import type { City } from "@/lib/cities";
import { getCityBySlug } from "@/lib/cities";

export type SaleType = "garage" | "estate";
export type Condition = "new" | "like new" | "good" | "fair" | "for parts";

export type SellerTrust = {
  rating: number;       // 0–5
  sales: number;
  responseRate: number; // 0–100
  responseTime: string; // "< 1h", "< 2h", etc.
  memberSince: string;  // "Mar 2023"
  phoneVerified: boolean;
  idVerified: boolean;
  topSeller: boolean;
  vouched: boolean;
};

export type PickupPhoto = {
  src: string;
  source: "seller" | "buyer";
  submittedBy?: string;
  caption?: string;
};

export type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition?: Condition;
  location: string;
  distance: string;
  seller: string;
  sellerTrust?: SellerTrust;
  image: string;
  lat: number;
  lng: number;
  isGarageSale?: boolean;
  saleType?: SaleType;
  description?: string;
  date?: string;
  postedHoursAgo?: number;
  pickupPhotos?: PickupPhoto[];
};

export function timeAgo(hours: number): string {
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const T: Record<string, SellerTrust> = {
  top:    { rating: 4.9, sales: 38, responseRate: 97, responseTime: "< 1h",  memberSince: "Mar 2023", phoneVerified: true,  idVerified: true,  topSeller: true,  vouched: true  },
  solid:  { rating: 4.7, sales: 14, responseRate: 91, responseTime: "< 2h",  memberSince: "Aug 2023", phoneVerified: true,  idVerified: false, topSeller: false, vouched: true  },
  new:    { rating: 4.5, sales:  3, responseRate: 80, responseTime: "< 4h",  memberSince: "Jan 2024", phoneVerified: true,  idVerified: false, topSeller: false, vouched: false },
  unver:  { rating: 0,   sales:  0, responseRate: 60, responseTime: "< 12h", memberSince: "Apr 2024", phoneVerified: false, idVerified: false, topSeller: false, vouched: false },
};

const TEMPLATES: (Omit<Listing, "lat" | "lng" | "distance"> & { dLat: number; dLng: number })[] = [
  { id: "1",  title: "Craftsman Lawn Mower — Self-Propelled", price: 180,    category: "Outdoors",     condition: "good",      location: "your neighborhood", seller: "Mike D.",          sellerTrust: T.solid,  image: "/listings/lawnmower.png",      dLat: -0.010, dLng:  0.016, postedHoursAgo: 2,   description: "Runs great, tune-up last spring. Pick up only.", pickupPhotos: [{ src: "/listings/lawnmower.png", source: "seller", caption: "Curb pickup — look for the green mailbox" }] },
  { id: "2",  title: "Cedar Porch Bench w/ Cup Holders",      price: 275,    category: "Furniture",    condition: "like new",  location: "nearby",            seller: "Jordan K.",        sellerTrust: T.top,    image: "/listings/bench.png",          dLat: -0.027, dLng:  0.011, postedHoursAgo: 5,   description: "Handmade cedar bench. Built-in cup holders. Never been rained on.", pickupPhotos: [{ src: "/listings/bench.png", source: "seller", caption: "On the front porch, tan house, white trim" }, { src: "/listings/bench.png", source: "buyer", submittedBy: "Alex R.", caption: "Easy to find, bench is right out front" }] },
  { id: "3",  title: "Neighborhood Garage Sale — Sat 9am",    price: 0,      category: "Sales",                         location: "down the street",   seller: "Elm St Neighbors", sellerTrust: T.solid,  image: "/listings/grill.png",          dLat: -0.020, dLng: -0.015, isGarageSale: true, saleType: "garage", description: "8 households. Furniture, kids' toys, kitchenware, vinyl records, plants. Cash + Venmo.", date: "Sat, Jun 8 · 9am–3pm" },
  { id: "4",  title: "PS5 Digital Edition",                   price: 350,    category: "Electronics",  condition: "good",      location: "nearby",            seller: "Devon L.",         sellerTrust: T.new,    image: "/listings/ps5.png",            dLat:  0.009, dLng:  0.025, postedHoursAgo: 1,   description: "Works perfect. Selling because I upgraded." },
  { id: "5",  title: "TV Stand w/ Electric Fireplace",        price: 220,    category: "Furniture",    condition: "good",      location: "your area",         seller: "Priya S.",         sellerTrust: T.top,    image: "/listings/tv-stand.png",       dLat:  0.007, dLng: -0.009, postedHoursAgo: 11,  description: "Fits up to 65\". Fireplace insert lights up, heater works." },
  { id: "6",  title: "Estate Sale — 3 Generations",           price: 0,      category: "Sales",                         location: "nearby block",      seller: "The Chen Family",  sellerTrust: T.solid,  image: "/listings/retro-consoles.png", dLat: -0.014, dLng: -0.064, isGarageSale: true, saleType: "estate", description: "Antique furniture, retro electronics, tools, kitchen, jewelry. Early birds welcome.", date: "Sun, Jun 9 · 8am–2pm" },
  { id: "7",  title: "FLEX 12\" Cordless Miter Saw",          price: 420,    category: "Tools",        condition: "like new",  location: "nearby",            seller: "Sam T.",           sellerTrust: T.top,    image: "/listings/miter-saw.png",      dLat:  0.033, dLng: -0.007, postedHoursAgo: 3,   description: "24V, barely used. Has original box and blade." },
  { id: "8",  title: "Maytag Maxima Washer & Dryer Set",      price: 650,    category: "Appliances",   condition: "good",      location: "your neighborhood", seller: "Renee F.",         sellerTrust: T.solid,  image: "/listings/washer-dryer.png",   dLat: -0.009, dLng: -0.005, postedHoursAgo: 26,  description: "Both work perfectly. Moving, can't take them. Must take both." },
  { id: "9",  title: "Singer Tradition Sewing Machine",       price: 75,     category: "Crafts",       condition: "fair",      location: "nearby",            seller: "Alex M.",          sellerTrust: T.new,    image: "/listings/sewing-machine.png", dLat:  0.011, dLng: -0.034, postedHoursAgo: 48,  description: "Lightly used. All feet and manual included." },
  { id: "10", title: "Block Party Garage Sale — Multi-Family",price: 0,      category: "Sales",                         location: "2 blocks away",     seller: "20th St Block",    sellerTrust: T.solid,  image: "/listings/lawnmower.png",      dLat: -0.010, dLng:  0.030, isGarageSale: true, saleType: "garage", description: "12+ homes participating. Maps at the corner. Live music + lemonade stand.", date: "Sat, Jun 15 · 10am–4pm" },
  { id: "11", title: "GMC Yukon AT4 — Lifted & Loaded",       price: 58500,  category: "Vehicles",     condition: "like new",  location: "nearby",            seller: "Hana O.",          sellerTrust: T.top,    image: "/listings/gmc.png",            dLat:  0.023, dLng: -0.008, postedHoursAgo: 4,   description: "2022, 34k miles. AT4 trim, aftermarket wheels and tires. Clean title." },
  { id: "12", title: "Retro Console Lot — NES, SNES, PS1",    price: 290,    category: "Electronics",  condition: "good",      location: "your area",         seller: "Marcus B.",        sellerTrust: T.new,    image: "/listings/retro-consoles.png", dLat:  0.002, dLng: -0.001, postedHoursAgo: 72,  description: "All tested and working. Includes controllers and some games." },
  { id: "13", title: "Mercedes G-Wagon AMG",                  price: 89000,  category: "Vehicles",     condition: "like new",  location: "nearby",            seller: "Tyler R.",         sellerTrust: T.unver,  image: "/listings/g-wagon.png",        dLat: -0.018, dLng:  0.022, postedHoursAgo: 168, description: "2018 G63. Black on black. Low miles, mint condition." },
  { id: "14", title: "Piper Seneca Twin Engine",              price: 185000, category: "Vehicles",     condition: "fair",      location: "your area",         seller: "Aviation Grp",     sellerTrust: T.solid,  image: "/listings/plane.png",          dLat:  0.041, dLng: -0.019, postedHoursAgo: 336, description: "1979 PA-34. 4200 TT airframe, fresh annual. IFR equipped." },
  { id: "15", title: "Char-Broil 4-Burner Gas Grill",         price: 95,     category: "Outdoors",     condition: "fair",      location: "nearby",            seller: "Dave K.",          sellerTrust: T.new,    image: "/listings/grill.png",          dLat: -0.032, dLng:  0.014, postedHoursAgo: 8,   description: "Works well, just upgraded. Side burner included." },
  { id: "16", title: "Sony CRT TV — 27\"",                    price: 40,     category: "Electronics",  condition: "for parts", location: "your neighborhood", seller: "Old Timer",        sellerTrust: T.unver,  image: "/listings/crt-tv.png",         dLat:  0.005, dLng: -0.028, postedHoursAgo: 120, description: "Perfect for retro gaming. Composite + coax inputs." },
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

const DEFAULT_CITY = getCityBySlug("wichita-ks") ?? getCityBySlug("san-francisco-ca")!;
export const LISTINGS = getListings(DEFAULT_CITY);

export const CATEGORIES = ["All", "Sales", "Vehicles", "Electronics", "Furniture", "Tools", "Appliances", "Outdoors", "Crafts"];
export const CONDITIONS: Condition[] = ["new", "like new", "good", "fair", "for parts"];
