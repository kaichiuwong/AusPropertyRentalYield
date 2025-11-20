export enum City {
  MELBOURNE = 'Melbourne',
  SYDNEY = 'Sydney',
  BRISBANE = 'Brisbane',
  PERTH = 'Perth',
  ADELAIDE = 'Adelaide',
  HOBART = 'Hobart',
  DARWIN = 'Darwin'
}

export enum PropertyType {
  HOUSE = 'House',
  APARTMENT = 'Apartment',
  UNIT = 'Unit',
  TOWNHOUSE = 'Townhouse'
}

export interface MarketFilters {
  bedrooms: string;
  bathrooms: string;
  parking: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface SuburbData {
  suburbName: string;
  medianSoldPrice: number;
  medianWeeklyRent: number;
  rentalYield: number;
  propertyType: PropertyType;
}

export interface MarketAnalysis {
  city: City;
  propertyType: PropertyType;
  lastUpdated: string;
  data: SuburbData[];
  summary: string;
}

export enum FetchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}