import { Country } from '../types';

export async function fetchCountries(): Promise<Country[]> {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,population,flags,region,subregion,capital,languages,currencies,cca2');
    const data = await response.json();
    
    return data.map((item: any) => ({
      name: item.name.common,
      population: item.population,
      flag: item.flags.svg || item.flags.png,
      region: item.region,
      subregion: item.subregion,
      capital: item.capital?.[0] || 'Unknown',
      languages: Object.values(item.languages || {}),
      currencies: Object.values(item.currencies || {}).map((c: any) => `${c.name} (${c.symbol})`),
      cca2: item.cca2
    })).sort((a: Country, b: Country) => b.population - a.population);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}
