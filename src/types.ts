export interface Country {
  name: string;
  population: number;
  flag: string;
  region: string;
  subregion: string;
  capital: string;
  languages: string[];
  currencies: string[];
  cca2: string;
}

export interface SpinResult {
  country: Country;
  probability: number;
  city?: string;
  survivalProbability?: string;
  socialClass?: string;
  insight?: string;
  rankings?: { category: string; rank: string }[];
  cons?: string[];
}
