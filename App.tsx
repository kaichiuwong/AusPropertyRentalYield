
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import YieldChart from './components/YieldChart';
import YieldTable from './components/YieldTable';
import PriceRangeSlider from './components/PriceRangeSlider';
import { City, PropertyType, FetchStatus, MarketAnalysis, MarketFilters } from './types';
import { fetchMarketData } from './services/geminiService';
import { MapPin, Loader2, RefreshCcw, Info, Filter, Home, Building, Bed, Bath, Car, ChevronDown } from 'lucide-react';

// Constants for Slider
const MIN_PRICE_LIMIT = 0;
const MAX_PRICE_LIMIT = 3000000; // $3M
const PRICE_STEP = 50000; // $50k increments

// City Grouping Helper
const CAPITALS = [
  City.MELBOURNE, City.SYDNEY, City.BRISBANE, City.PERTH, 
  City.ADELAIDE, City.HOBART, City.DARWIN, City.CANBERRA
];

const REGIONAL_QLD = [
  City.GOLD_COAST, City.SUNSHINE_COAST, City.CAIRNS, 
  City.TOWNSVILLE, City.TOOWOOMBA, City.ROCKHAMPTON
];

const REGIONAL_NSW = [
  City.NEWCASTLE, City.WOLLONGONG, City.TWEED_HEADS, 
  City.ALBURY, City.WAGGA_WAGGA
];

const REGIONAL_VIC = [
  City.GEELONG, City.BALLARAT, City.BENDIGO
];

const REGIONAL_TAS = [
  City.LAUNCESTON, City.DEVONPORT
];

const REGIONAL_GROUPS: { [key: string]: City[] } = {
  'Queensland': REGIONAL_QLD,
  'New South Wales': REGIONAL_NSW,
  'Victoria': REGIONAL_VIC,
  'Tasmania': REGIONAL_TAS
};

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Try to get theme from local storage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [activeCity, setActiveCity] = useState<City>(City.MELBOURNE);
  // Regional Dropdown State
  const [selectedRegionalState, setSelectedRegionalState] = useState<string>('');

  const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.HOUSE);
  
  // Feature Filters
  const [bedrooms, setBedrooms] = useState<string>('3');
  const [bathrooms, setBathrooms] = useState<string>('2');
  const [parking, setParking] = useState<string>('2');

  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [marketData, setMarketData] = useState<MarketAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Price Filter State (Numbers for slider)
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE_LIMIT, MAX_PRICE_LIMIT]);
  // Debounced price state to prevent API spam while dragging
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([MIN_PRICE_LIMIT, MAX_PRICE_LIMIT]);

  // Theme Toggle Logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const loadData = useCallback(async (
    city: City, 
    type: PropertyType, 
    filters: MarketFilters
  ) => {
    setStatus(FetchStatus.LOADING);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("Missing API Key. Please set process.env.API_KEY.");
      }
      const data = await fetchMarketData(city, type, filters);
      setMarketData(data);
      setStatus(FetchStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setStatus(FetchStatus.ERROR);
    }
  }, []);

  // Smart Defaults: Reset features when property type changes
  const handlePropertyTypeChange = (type: PropertyType) => {
    setPropertyType(type);
    if (type === PropertyType.APARTMENT || type === PropertyType.UNIT) {
      setBedrooms('2');
      setBathrooms('1');
      setParking('1');
      setPriceRange([0, 1500000]); // Lower default max for units
      setDebouncedPriceRange([0, 1500000]);
    } else {
      setBedrooms('3');
      setBathrooms('2');
      setParking('2');
      setPriceRange([0, 3000000]); // Higher default max for houses
      setDebouncedPriceRange([0, 3000000]);
    }
  };

  // Debounce Effect: Sync priceRange to debouncedPriceRange after user stops dragging
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 800); // 800ms delay

    return () => clearTimeout(timer);
  }, [priceRange]);

  // Main Data Load Effect
  useEffect(() => {
    // Convert slider numbers to filter strings (skip if default bounds to avoid over-constraining prompt)
    const minStr = debouncedPriceRange[0] > MIN_PRICE_LIMIT ? debouncedPriceRange[0].toString() : '';
    const maxStr = debouncedPriceRange[1] < MAX_PRICE_LIMIT ? debouncedPriceRange[1].toString() : '';

    loadData(activeCity, propertyType, { 
      bedrooms, 
      bathrooms, 
      parking, 
      minPrice: minStr, 
      maxPrice: maxStr 
    });
  }, [activeCity, propertyType, bedrooms, bathrooms, parking, debouncedPriceRange, loadData]); 

  const handleRefresh = () => {
    const minStr = debouncedPriceRange[0] > MIN_PRICE_LIMIT ? debouncedPriceRange[0].toString() : '';
    const maxStr = debouncedPriceRange[1] < MAX_PRICE_LIMIT ? debouncedPriceRange[1].toString() : '';
    
    loadData(activeCity, propertyType, { 
      bedrooms, 
      bathrooms, 
      parking, 
      minPrice: minStr, 
      maxPrice: maxStr 
    });
  };

  const formatPriceDisplay = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const handleCapitalClick = (city: City) => {
    setActiveCity(city);
    setSelectedRegionalState(''); // Reset regional dropdown when a capital is picked
  };

  const handleRegionalCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value as City;
    if (city) {
      setActiveCity(city);
    }
  };

  const formatCityLabel = (city: string) => {
    return city.replace(/, (QLD|NSW|VIC|TAS|WA|SA|ACT|NT)/, '');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Controls: City Selection */}
        <div className="flex flex-col gap-4 mb-6">
           <div className="flex justify-between items-center">
             <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Location</h2>
             <button
                onClick={handleRefresh}
                disabled={status === FetchStatus.LOADING}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${status === FetchStatus.LOADING ? 'animate-spin' : ''}`} />
                Refresh
              </button>
           </div>
           
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 transition-colors duration-200">
              {/* Capitals */}
              <div className="mb-4">
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1 mb-2 block">Capital Cities</span>
                 <div className="flex flex-wrap gap-2">
                    {CAPITALS.map((city) => (
                       <button
                         key={city}
                         onClick={() => handleCapitalClick(city)}
                         className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                           activeCity === city
                             ? 'bg-blue-600 text-white shadow-md'
                             : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                         }`}
                       >
                         <MapPin className={`w-3 h-3 ${activeCity === city ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                         {formatCityLabel(city)}
                       </button>
                    ))}
                 </div>
              </div>
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

              {/* Regional Areas Dropdowns */}
              <div>
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1 mb-2 block">Regional Areas</span>
                 <div className="flex flex-col sm:flex-row gap-4">
                    
                    {/* 1. Select State */}
                    <div className="relative w-full sm:w-64">
                       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <ChevronDown className="h-4 w-4" />
                       </div>
                       <select
                          value={selectedRegionalState}
                          onChange={(e) => setSelectedRegionalState(e.target.value)}
                          className="block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:placeholder-slate-400 dark:text-white text-slate-900 transition-colors"
                       >
                          <option value="">Select State</option>
                          {Object.keys(REGIONAL_GROUPS).map((state) => (
                             <option key={state} value={state}>{state}</option>
                          ))}
                       </select>
                    </div>

                    {/* 2. Select City */}
                    <div className="relative w-full sm:w-64">
                        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${!selectedRegionalState ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500'}`}>
                            <ChevronDown className="h-4 w-4" />
                        </div>
                        <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 ${!selectedRegionalState ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                            <MapPin className="h-4 w-4" />
                        </div>
                        <select
                           value={selectedRegionalState && REGIONAL_GROUPS[selectedRegionalState]?.includes(activeCity) ? activeCity : ''}
                           onChange={handleRegionalCityChange}
                           disabled={!selectedRegionalState}
                           className="block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:placeholder-slate-400 dark:text-white text-slate-900 transition-colors disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:border-slate-200 dark:disabled:border-slate-800"
                        >
                           <option value="">{selectedRegionalState ? 'Select City' : 'Select State First'}</option>
                           {selectedRegionalState && REGIONAL_GROUPS[selectedRegionalState].map((city) => (
                              <option key={city} value={city}>
                                 {formatCityLabel(city)}
                              </option>
                           ))}
                        </select>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 transition-colors duration-200">
           <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-100 dark:border-slate-800 pb-2">
              <Filter className="w-4 h-4" />
              <h3>Property Config & Filters</h3>
           </div>
           
           <div className="flex flex-col lg:flex-row gap-8 lg:gap-6">
              
              {/* Column 1: Property Type */}
              <div className="flex-1 min-w-[200px]">
                 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Type</label>
                 <div className="flex flex-wrap gap-2">
                    {Object.values(PropertyType).map((type) => (
                       <button
                          key={type}
                          onClick={() => handlePropertyTypeChange(type)}
                          disabled={status === FetchStatus.LOADING}
                          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            propertyType === type 
                            ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300 font-medium ring-1 ring-indigo-200 dark:ring-indigo-500/20' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                       >
                          {type === PropertyType.HOUSE || type === PropertyType.TOWNHOUSE ? <Home className="inline w-3 h-3 mr-1.5 mb-0.5" /> : <Building className="inline w-3 h-3 mr-1.5 mb-0.5" />}
                          {type}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Column 2: Features (Bed/Bath/Car) */}
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Features</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Bedrooms */}
                  <div>
                    <div className="relative">
                      <Bed className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        disabled={status === FetchStatus.LOADING}
                        className="w-full pl-9 pr-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer transition-colors"
                      >
                        <option value="1">1 Bed</option>
                        <option value="2">2 Bed</option>
                        <option value="3">3 Bed</option>
                        <option value="4">4 Bed</option>
                        <option value="5">5+ Bed</option>
                      </select>
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <div className="relative">
                      <Bath className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <select
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        disabled={status === FetchStatus.LOADING}
                        className="w-full pl-9 pr-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer transition-colors"
                      >
                         <option value="1">1 Bath</option>
                         <option value="2">2 Bath</option>
                         <option value="3">3+ Bath</option>
                      </select>
                    </div>
                  </div>

                  {/* Parking */}
                  <div>
                    <div className="relative">
                      <Car className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <select
                        value={parking}
                        onChange={(e) => setParking(e.target.value)}
                        disabled={status === FetchStatus.LOADING}
                        className="w-full pl-9 pr-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer transition-colors"
                      >
                        <option value="0">No Car</option>
                        <option value="1">1 Car</option>
                        <option value="2">2 Car</option>
                        <option value="3">3+ Car</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Price Range Slider */}
              <div className="flex-1 min-w-[260px]">
                 <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Median Price</label>
                    <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded font-medium">
                       {formatPriceDisplay(priceRange[0])} - {formatPriceDisplay(priceRange[1])}{priceRange[1] === MAX_PRICE_LIMIT ? '+' : ''}
                    </span>
                 </div>
                 
                 <PriceRangeSlider 
                    min={MIN_PRICE_LIMIT} 
                    max={MAX_PRICE_LIMIT} 
                    step={PRICE_STEP} 
                    value={priceRange}
                    onChange={(vals) => setPriceRange(vals)}
                 />

                 <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                    <span>$0</span>
                    <span>$1M</span>
                    <span>$2M</span>
                    <span>$3M+</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
                <p className="font-semibold">AI-Generated Market Data</p>
                <p className="mt-1 opacity-90">
                    Due to CORS restrictions on live scraping, this dashboard uses Google's Gemini 2.5 Flash model to generate realistic market estimates for <strong>{bedrooms}-bed, {bathrooms}-bath, {parking}-car {propertyType}s</strong> in {activeCity}.
                </p>
            </div>
        </div>

        {/* Content Area */}
        {status === FetchStatus.LOADING && (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
              Analyzing {bedrooms}-bed {propertyType.toLowerCase()} market in {activeCity}...
            </p>
          </div>
        )}

        {status === FetchStatus.ERROR && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-800 dark:text-red-300 font-semibold mb-2">Error loading data</p>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button 
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
                Try Again
            </button>
          </div>
        )}

        {status === FetchStatus.SUCCESS && marketData && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{activeCity} {propertyType} Market</h2>
                      <span className="px-2 py-0.5 bg-blue-500/30 rounded-full text-xs border border-blue-400/30">
                        {bedrooms} Bed • {bathrooms} Bath • {parking} Car
                      </span>
                    </div>
                    <p className="text-blue-100 leading-relaxed max-w-3xl">{marketData.summary}</p>
                 </div>
              </div>
              <div className="mt-4 flex gap-4 text-xs text-blue-200 font-mono border-t border-blue-500/30 pt-4">
                <span>UPDATED: {marketData.lastUpdated}</span>
                <span>SOURCE: AI Market Analysis</span>
                <span>SUBURBS ANALYZED: {marketData.data.length}</span>
              </div>
            </div>

            {marketData.data.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed transition-colors">
                   <p className="text-slate-500 dark:text-slate-400 font-medium">No suburbs found matching your search criteria.</p>
                   <button 
                      onClick={() => { 
                        const defaultRange: [number, number] = [0, 3000000];
                        setPriceRange(defaultRange);
                        setDebouncedPriceRange(defaultRange);
                      }}
                      className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
                   >
                      Reset Price Filters
                   </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <YieldChart data={marketData.data} isDarkMode={isDarkMode} />
                  <YieldTable data={marketData.data} />
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
