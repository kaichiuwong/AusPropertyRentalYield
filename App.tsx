import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import YieldChart from './components/YieldChart';
import YieldTable from './components/YieldTable';
import { City, PropertyType, FetchStatus, MarketAnalysis, MarketFilters } from './types';
import { fetchMarketData } from './services/geminiService';
import { MapPin, Loader2, RefreshCcw, Info, Filter, Home, Building, Bed, Bath, Car } from 'lucide-react';

const App: React.FC = () => {
  const [activeCity, setActiveCity] = useState<City>(City.MELBOURNE);
  const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.HOUSE);
  
  // Feature Filters
  const [bedrooms, setBedrooms] = useState<string>('3');
  const [bathrooms, setBathrooms] = useState<string>('2');
  const [parking, setParking] = useState<string>('2');

  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [marketData, setMarketData] = useState<MarketAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Price Filter (Client-side)
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const loadData = useCallback(async (city: City, type: PropertyType, filters: MarketFilters) => {
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
    } else {
      setBedrooms('3');
      setBathrooms('2');
      setParking('2');
    }
  };

  // Reload data when any core filter changes
  useEffect(() => {
    loadData(activeCity, propertyType, { bedrooms, bathrooms, parking });
  }, [activeCity, propertyType, bedrooms, bathrooms, parking, loadData]);

  // Client-side filtering for Price Range
  const filteredData = useMemo(() => {
    if (!marketData) return [];
    
    return marketData.data.filter(item => {
      const price = item.medianSoldPrice;
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      return price >= min && price <= max;
    });
  }, [marketData, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Controls: City & Refresh */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
            {Object.values(City).map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeCity === city
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${activeCity === city ? 'text-white' : 'text-slate-400'}`} />
                {city}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadData(activeCity, propertyType, { bedrooms, bathrooms, parking })}
            disabled={status === FetchStatus.LOADING}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCcw className={`w-4 h-4 ${status === FetchStatus.LOADING ? 'animate-spin' : ''}`} />
            Refresh Estimates
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-8">
           <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b border-slate-100 pb-2">
              <Filter className="w-4 h-4" />
              <h3>Property Config & Filters</h3>
           </div>
           
           <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Column 1: Property Type */}
              <div className="flex-1 min-w-[200px]">
                 <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Type</label>
                 <div className="flex flex-wrap gap-2">
                    {Object.values(PropertyType).map((type) => (
                       <button
                          key={type}
                          onClick={() => handlePropertyTypeChange(type)}
                          disabled={status === FetchStatus.LOADING}
                          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            propertyType === type 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium ring-1 ring-indigo-200' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Features</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Bedrooms */}
                  <div>
                    <div className="relative">
                      <Bed className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        disabled={status === FetchStatus.LOADING}
                        className="w-full pl-9 pr-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer"
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
                        className="w-full pl-9 pr-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer"
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
                        className="w-full pl-9 pr-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer"
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

              {/* Column 3: Price Range */}
              <div className="flex-1 min-w-[240px]">
                 <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Median Price (AUD)</label>
                 <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                       <span className="absolute left-2.5 top-2 text-slate-400 text-sm">$</span>
                       <input 
                          type="number" 
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="Min"
                          className="w-full pl-6 pr-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                    <span className="text-slate-400">-</span>
                    <div className="relative flex-1">
                       <span className="absolute left-2.5 top-2 text-slate-400 text-sm">$</span>
                       <input 
                          type="number" 
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="Max"
                          className="w-full pl-6 pr-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
                <p className="font-semibold">AI-Generated Market Data</p>
                <p className="mt-1 opacity-90">
                    Due to CORS restrictions on live scraping, this dashboard uses Google's Gemini 2.5 Flash model to generate realistic market estimates for <strong>{bedrooms}-bed, {bathrooms}-bath, {parking}-car {propertyType}s</strong> in {activeCity}.
                </p>
            </div>
        </div>

        {/* Content Area */}
        {status === FetchStatus.LOADING && (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">
              Analyzing {bedrooms}-bed {propertyType.toLowerCase()} market in {activeCity}...
            </p>
          </div>
        )}

        {status === FetchStatus.ERROR && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-semibold mb-2">Error loading data</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
                onClick={() => loadData(activeCity, propertyType, { bedrooms, bathrooms, parking })}
                className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
            >
                Try Again
            </button>
          </div>
        )}

        {status === FetchStatus.SUCCESS && marketData && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
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

            {/* Empty State for Filtering */}
            {filteredData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                   <p className="text-slate-500 font-medium">No suburbs found matching your price range.</p>
                   <button 
                      onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                      className="mt-2 text-blue-600 text-sm hover:underline"
                   >
                      Clear Price Filters
                   </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <YieldChart data={filteredData} />
                  <YieldTable data={filteredData} />
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;