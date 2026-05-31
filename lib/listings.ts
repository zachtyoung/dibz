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

const TEMPLATES: (Omit<Listing, "lat" | "lng" | "distance"> & { dLat: number; dLng: number })[] = [
  { id: "1",  title: "Craftsman Lawn Mower — Self-Propelled", price: 180, category: "Outdoors",   location: "your neighborhood", seller: "Mike D.",         image: "/listings/lawnmower.png",      dLat: -0.010, dLng:  0.016, description: "Runs great, tune-up last spring. Pick up only." },
  { id: "2",  title: "Cedar Porch Bench w/ Cup Holders",      price: 275, category: "Furniture",  location: "nearby",            seller: "Jordan K.",       image: "/listings/bench.png",          dLat: -0.027, dLng:  0.011, description: "Handmade cedar bench. Built-in cup holders. Never been rained on." },
  { id: "3",  title: "Neighborhood Garage Sale — Sat 9am",    price: 0,   category: "Garage Sale",location: "down the street",   seller: "Elm St Neighbors",image: "/listings/grill.png",          dLat: -0.020, dLng: -0.015, isGarageSale: true, description: "8 households. Furniture, kids' toys, kitchenware, vinyl records, plants. Cash + Venmo.", date: "Sat, Jun 8 · 9am–3pm" },
  { id: "4",  title: "PS5 Digital Edition",                   price: 350, category: "Electronics",location: "nearby",            seller: "Devon L.",        image: "/listings/ps5.png",            dLat:  0.009, dLng:  0.025, description: "Works perfect. Selling because I upgraded." },
  { id: "5",  title: "TV Stand w/ Electric Fireplace",        price: 220, category: "Furniture",  location: "your area",         seller: "Priya S.",        image: "/listings/tv-stand.png",       dLat:  0.007, dLng: -0.009, description: "Fits up to 65\". Fireplace insert lights up, heater works." },
  { id: "6",  title: "Estate Sale — 3 Generations",           price: 0,   category: "Garage Sale",location: "nearby block",      seller: "The Chen Family", image: "/listings/retro-consoles.png", dLat: -0.014, dLng: -0.064, isGarageSale: true, description: "Antique furniture, retro electronics, tools, kitchen, jewelry. Early birds welcome.", date: "Sun, Jun 9 · 8am–2pm" },
  { id: "7",  title: "FLEX 12\" Cordless Miter Saw",          price: 420, category: "Tools",      location: "nearby",            seller: "Sam T.",          image: "/listings/miter-saw.png",      dLat:  0.033, dLng: -0.007, description: "24V, barely used. Has original box and blade." },
  { id: "8",  title: "Maytag Maxima Washer & Dryer Set",      price: 650, category: "Appliances", location: "your neighborhood", seller: "Renee F.",        image: "/listings/washer-dryer.png",   dLat: -0.009, dLng: -0.005, description: "Both work perfectly. Moving, can't take them. Must take both." },
  { id: "9",  title: "Singer Tradition Sewing Machine",       price: 75,  category: "Crafts",     location: "nearby",            seller: "Alex M.",         image: "/listings/sewing-machine.png", dLat:  0.011, dLng: -0.034, description: "Lightly used. All feet and manual included." },
  { id: "10", title: "Block Party Garage Sale — Multi-Family",price: 0,   category: "Garage Sale",location: "2 blocks away",     seller: "20th St Block",   image: "/listings/lawnmower.png",      dLat: -0.010, dLng:  0.030, isGarageSale: true, description: "12+ homes participating. Maps at the corner. Live music + lemonade stand.", date: "Sat, Jun 15 · 10am–4pm" },
  { id: "11", title: "GMC Yukon AT4 — Lifted & Loaded",       price: 58500,category: "Vehicles",  location: "nearby",            seller: "Hana O.",         image: "/listings/gmc.png",            dLat:  0.023, dLng: -0.008, description: "2022, 34k miles. AT4 trim, aftermarket wheels and tires. Clean title." },
  { id: "12", title: "Retro Console Lot — NES, SNES, PS1",    price: 290, category: "Electronics",location: "your area",         seller: "Marcus B.",       image: "/listings/retro-consoles.png", dLat:  0.002, dLng: -0.001, description: "All tested and working. Includes controllers and some games." },
  { id: "13", title: "Mercedes G-Wagon AMG",                  price: 89000,category: "Vehicles",  location: "nearby",            seller: "Tyler R.",        image: "/listings/g-wagon.png",        dLat: -0.018, dLng:  0.022, description: "2018 G63. Black on black. Low miles, mint condition." },
  { id: "14", title: "Piper Seneca Twin Engine",              price: 185000,category: "Vehicles", location: "your area",         seller: "Aviation Grp",    image: "/listings/plane.png",          dLat:  0.041, dLng: -0.019, description: "1979 PA-34. 4200 TT airframe, fresh annual. IFR equipped." },
  { id: "15", title: "Char-Broil 4-Burner Gas Grill",         price: 95,  category: "Outdoors",   location: "nearby",            seller: "Dave K.",         image: "/listings/grill.png",          dLat: -0.032, dLng:  0.014, description: "Works well, just upgraded. Side burner included." },
  { id: "16", title: "Sony CRT TV — 27\"",                    price: 40,  category: "Electronics",location: "your neighborhood", seller: "Old Timer",       image: "/listings/crt-tv.png",         dLat:  0.005, dLng: -0.028, description: "Perfect for retro gaming. Composite + coax inputs." },
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

export const CATEGORIES = ["All", "Garage Sale", "Vehicles", "Electronics", "Furniture", "Tools", "Appliances", "Outdoors", "Crafts"];
