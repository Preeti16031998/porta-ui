# API Integration Setup Guide

This guide explains how to set up and use the API integration in your Porta UI application.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development

# Optional: Additional configuration
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_APP_NAME=Porta App
NEXT_PUBLIC_APP_VERSION=0.1.0
```

## Production Environment

For production, set these environment variables in your hosting platform:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-production-api.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEBUG_MODE=false
```

## File Structure

```
src/
├── lib/
│   └── api.ts              # Core API client and utilities
├── config/
│   └── env.ts              # Environment configuration
├── services/
│   └── api.ts              # API service classes
└── hooks/
    └── useApi.ts           # React hooks for API calls
```

## Usage Examples

### 1. Basic API Call

```tsx
import { useApi } from '@/hooks/useApi';
import { PortfolioService } from '@/services/api';

function PortfolioComponent() {
  const { data, loading, error, execute } = useApi(
    PortfolioService.getPortfolioSummary,
    { autoFetch: true }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Portfolio: {data?.name}</h2>
      <p>Value: ${data?.value}</p>
      <button onClick={execute}>Refresh</button>
    </div>
  );
}
```

### 2. API Call with Parameters

```tsx
import { useApiWithParams } from '@/hooks/useApi';
import { NewsService } from '@/services/api';

function NewsComponent() {
  const { data, loading, error, execute } = useApiWithParams(
    NewsService.getCompanyNews
  );

  const fetchNews = (symbol: string) => {
    execute(symbol);
  };

  return (
    <div>
      <button onClick={() => fetchNews('AAPL')}>Get Apple News</button>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && (
        <ul>
          {data.map(news => (
            <li key={news.id}>{news.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 3. Real-time Updates with Polling

```tsx
import { useApiPolling } from '@/hooks/useApi';
import { PortfolioService } from '@/services/api';

function LivePortfolioComponent() {
  const { data, loading, error, startPolling, stopPolling, isPolling } = useApiPolling(
    PortfolioService.getPortfolioSummary,
    30000, // 30 seconds
    { autoFetch: true }
  );

  return (
    <div>
      <h2>Live Portfolio</h2>
      <button onClick={isPolling ? stopPolling : startPolling}>
        {isPolling ? 'Stop Updates' : 'Start Updates'}
      </button>
      
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && (
        <div>
          <p>Value: ${data.value}</p>
          <p>Change: {data.changePercent}%</p>
        </div>
      )}
    </div>
  );
}
```

### 4. Direct API Client Usage

```tsx
import { apiClient } from '@/lib/api';

async function handleSubmit(formData: any) {
  try {
    const response = await apiClient.post('/api/portfolio/update', formData);
    if (response.success) {
      console.log('Portfolio updated:', response.data);
    }
  } catch (error) {
    console.error('Update failed:', error);
  }
}
```

## Error Handling

The API client automatically handles common errors:

- **Network errors**: Connection issues, timeouts
- **HTTP errors**: 4xx and 5xx status codes
- **API errors**: Custom error responses from your API

```tsx
import { ApiError } from '@/lib/api';

try {
  const data = await apiClient.get('/api/endpoint');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(`HTTP ${error.status}: ${error.message}`);
  } else {
    console.log('Unexpected error:', error);
  }
}
```

## Configuration

### Environment-specific Settings

```tsx
import { getEnvironmentConfig } from '@/config/env';

const config = getEnvironmentConfig();

if (config.isDev) {
  console.log('Development mode - API URL:', config.apiUrl);
}

if (config.debugMode) {
  console.log('Debug mode enabled');
}
```

### Custom API Client

```tsx
import { ApiClient, API_CONFIG } from '@/lib/api';

const customConfig = {
  ...API_CONFIG,
  baseURL: 'https://custom-api.com',
  timeout: 15000,
};

const customClient = new ApiClient(customConfig);
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **API Keys**: Use server-side environment variables for sensitive data
3. **CORS**: Ensure your API allows requests from your frontend domain
4. **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check your API server's CORS configuration
2. **Environment Variables Not Loading**: Restart your development server
3. **API Timeouts**: Adjust the timeout value in your environment config
4. **Type Errors**: Ensure your API response types match the expected interfaces

### Debug Mode

Enable debug mode to see detailed API request/response information:

```bash
NEXT_PUBLIC_DEBUG_MODE=true
```

## API Endpoints

The following endpoints are expected from your API server:

- `GET /api/portfolio/summary` - Portfolio summary
- `GET /api/portfolio/holdings` - Portfolio holdings
- `GET /api/watchlist` - User watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/{symbol}` - Remove from watchlist
- `GET /api/news` - Market news
- `GET /api/news/{symbol}` - Company-specific news
- `GET /api/earnings/upcoming` - Upcoming earnings
- `GET /api/earnings/{symbol}/history` - Earnings history
- `GET /api/industry/performance` - Industry performance
- `GET /api/industry/sectors` - Sector analysis

## Next Steps

1. Create your `.env.local` file with the API configuration
2. Update your API server to match the expected endpoints
3. Test the integration with the provided examples
4. Customize the services and hooks for your specific needs
5. Add error boundaries and loading states to your components
