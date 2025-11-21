
export enum City {
  // Capitals
  MELBOURNE = 'Melbourne',
  SYDNEY = 'Sydney',
  BRISBANE = 'Brisbane',
  PERTH = 'Perth',
  ADELAIDE = 'Adelaide',
  HOBART = 'Hobart',
  DARWIN = 'Darwin',
  CANBERRA = 'Canberra',

  // Regional - QLD
  GOLD_COAST = 'Gold Coast, QLD',
  SUNSHINE_COAST = 'Sunshine Coast, QLD',
  TWEED_HEADS = 'Tweed Heads, NSW', // Geographically NSW, often grouped with Coolangatta
  CAIRNS = 'Cairns, QLD',
  TOWNSVILLE = 'Townsville, QLD',
  TOOWOOMBA = 'Toowoomba, QLD',
  ROCKHAMPTON = 'Rockhampton, QLD',

  // Regional - NSW
  NEWCASTLE = 'Newcastle, NSW',
  WOLLONGONG = 'Wollongong, NSW',
  ALBURY = 'Albury, NSW',
  WAGGA_WAGGA = 'Wagga Wagga, NSW',

  // Regional - VIC
  GEELONG = 'Geelong, VIC',
  BALLARAT = 'Ballarat, VIC',
  BENDIGO = 'Bendigo, VIC',

  // Regional - TAS
  LAUNCESTON = 'Launceston, TAS',
  DEVONPORT = 'Devonport, TAS'
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
