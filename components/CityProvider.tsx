"use client";
import { createContext, useContext } from "react";
import { useCity } from "@/lib/useCity";
import { CityPrompt } from "@/components/CityPrompt";
import type { City } from "@/lib/cities";

type CityContextValue = {
  city: City | null;
  loading: boolean;
  setCity: (c: City) => void;
};

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const { city, loading, failed, setCity } = useCity();

  return (
    <CityContext.Provider value={{ city, loading, setCity }}>
      {failed && <CityPrompt onCity={setCity} />}
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCityContext must be used within CityProvider");
  return ctx;
}
