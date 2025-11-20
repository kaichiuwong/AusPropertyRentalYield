import { GoogleGenAI, Type } from "@google/genai";
import { City, PropertyType, SuburbData, MarketAnalysis, MarketFilters } from "../types";

// Initialize Gemini Client
// Note: In a real-world scenario, API keys should be proxied or handled server-side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchMarketData = async (
  city: City, 
  propertyType: PropertyType, 
  filters: MarketFilters
): Promise<MarketAnalysis> => {
  const modelId = "gemini-2.5-flash";

  const specs = `${filters.bedrooms}-bedroom, ${filters.bathrooms}-bathroom, ${filters.parking}-carspace`;

  // Build price context for the prompt
  let priceContext = "";
  if (filters.minPrice && filters.maxPrice) {
    priceContext = ` with a median sold price between $${filters.minPrice} and $${filters.maxPrice}`;
  } else if (filters.minPrice) {
    priceContext = ` with a median sold price above $${filters.minPrice}`;
  } else if (filters.maxPrice) {
    priceContext = ` with a median sold price below $${filters.maxPrice}`;
  }

  const prompt = `
    Generate a realistic real estate market dataset for 15 popular suburbs in ${city}, Australia${priceContext}.
    
    Focus specifically on market data for: ${propertyType}s (${specs}).
    
    For each suburb, provide:
    1. The suburb name.
    2. A realistic current Median Sold Price (in AUD) for a ${specs} ${propertyType} based on late 2024/2025 trends.
    3. A realistic current Median Weekly Rent (in AUD) for a ${specs} ${propertyType}.
    
    Also provide a brief 1-sentence summary of the ${propertyType} market trend in ${city} for this specific configuration.
    
    Note: Direct scraping of realestate.com.au is restricted by CORS policies in browser environments, so generate high-confidence estimates based on your internal knowledge of the Australian property market.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Market trend summary" },
            suburbs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  medianPrice: { type: Type.NUMBER, description: "Median House Price in AUD" },
                  weeklyRent: { type: Type.NUMBER, description: "Median Weekly Rent in AUD" },
                },
                required: ["name", "medianPrice", "weeklyRent"]
              }
            }
          },
          required: ["summary", "suburbs"]
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    
    if (!json.suburbs) {
      throw new Error("Invalid response structure");
    }

    const processedData: SuburbData[] = json.suburbs.map((item: any) => {
      const yieldVal = ((item.weeklyRent * 52) / item.medianPrice) * 100;
      return {
        suburbName: item.name,
        medianSoldPrice: item.medianPrice,
        medianWeeklyRent: item.weeklyRent,
        rentalYield: parseFloat(yieldVal.toFixed(2)),
        propertyType: propertyType
      };
    });

    // Sort by yield descending
    processedData.sort((a, b) => b.rentalYield - a.rentalYield);

    return {
      city,
      propertyType,
      lastUpdated: new Date().toLocaleDateString(),
      data: processedData,
      summary: json.summary
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch market data. Please check your API Key.");
  }
};