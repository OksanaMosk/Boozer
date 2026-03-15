import {CurrencyCodeType} from "@/models/IVenue";

export interface IAirport {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
}

export interface ITravelSegment {
  step_type: "to_airport" | "flight" | "from_airport";
  km: number;
  price: number;
  cost: number;
  from_city: string;
  from_code: string;
  to_city: string;
  to_code: string;
}

export interface ITravelCalculation {
  currency: CurrencyCodeType;
  airports: {
    start: IAirport;
    end: IAirport;
  };
  venue?: {
    city: string;
  };
  travel_segments: ITravelSegment[];
  user_city?: string;
}

export interface ITravelLogistics {
  id?: string;
  venue: string;
  step_type: "to_airport" | "flight" | "from_airport";
  price_per_km: number;
  currency: CurrencyCodeType;
}

export interface ITravelEstimate {
  start_airport: string;
  end_airport: string;
  segments: ITravelSegment[];
  total_price: number;
}