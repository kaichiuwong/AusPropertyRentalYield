# AusProperty Yield Dashboard

A real-time rental yield dashboard for Australian suburbs, powered by AI estimates using Google's Gemini API.

## Features

- **AI-Powered Market Data**: Generates realistic market estimates for sold prices and rental yields using the Gemini 2.5 Flash model.
- **Interactive Visualization**: Visualizes yield data using Recharts.
- **Comprehensive Filtering**: Filter by City (Capital & Regional), Property Type, Bedrooms, Bathrooms, Parking, and Price Range.
- **Dark Mode Support**: Fully responsive UI with light and dark themes.

## Prerequisites

Before you begin, ensure you have:
- Node.js installed (v18 or higher recommended).
- A Google Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/)).

## Local Development

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables**
    Create a `.env` file in the root directory:
    ```bash
    touch .env
    ```
    Add your API key:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

3.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The app will run at `http://localhost:5173`.

## Deployment

### Vercel (Recommended)

This project is configured for easy deployment on Vercel.

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3.  Import your repository.
4.  In the **"Configure Project"** step:
    - **Framework Preset**: Vite (should be detected automatically).
    - **Environment Variables**: Add a new variable:
        - Key: `API_KEY`
        - Value: `your_actual_api_key`
5.  Click **"Deploy"**.

### Manual Build

To build the project for production:

```bash
npm run build
```

This generates a `dist` folder containing the static assets, which can be hosted on any static site hosting service (Netlify, GitHub Pages, AWS S3, etc.).

**Note for other platforms**: Ensure you configure the `API_KEY` environment variable in your hosting provider's settings.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Icons**: Lucide React
- **Charts**: Recharts

## Disclaimer

This application uses AI to estimate market data because live scraping of real estate websites is restricted by CORS policies in browser environments. While the AI uses its internal knowledge base to generate realistic figures, this data should be used for demonstration and educational purposes only, not for financial decisions.
