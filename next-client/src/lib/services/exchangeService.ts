import venueServices from "@/lib/services/venueService";

interface Rates {
  USD: number;
  EUR: number;
}

class ExchangeService {
  private rates: Rates = { USD: 1, EUR: 1 };
  private initialized = false;
  async init(accessToken: string) {
    if (this.initialized) return this.rates;
    try {
      const { data } = await venueServices.exchangeService.getRates({ accessToken });
      this.rates = data;
      this.initialized = true;
      console.log("💱 Exchange rates loaded:", this.rates);
    } catch (err) {
      console.error("Failed to fetch exchange rates", err);
      this.rates = { USD: 1, EUR: 1 };
    }
    return this.rates;
  }
  getRates() {
    return this.rates;
  }
}

export const exchangeService = new ExchangeService();