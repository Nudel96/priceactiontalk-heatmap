# Integration Guide

This guide explains how to integrate the EdgeFinder Heatmap component with your existing backend scraper system and deploy it as a standalone product.

## Backend Integration

### 1. API Compatibility Check

Your backend scraper already provides the correct data structure. The heatmap component expects:

```typescript
interface HeatmapResponse {
  asset: string;           // e.g., "USD", "USOIL"
  score: number;          // Total score (-24 to +24)
  scale: [number, number]; // [-24, 24]
  pillars: Pillar[];      // Sentiment, Technical, Economic
  as_of: string;          // ISO timestamp
  version: string;        // API version
}
```

### 2. Required Backend Endpoints

#### Single Asset Endpoint (Already Implemented)
```
GET /heatmap?asset={SYMBOL}
```

#### Recommended: Batch Endpoint
Add this endpoint to your backend for better performance:

```python
# In your FastAPI backend
@router.get("/heatmap/batch")
async def get_batch_heatmap(assets: str = Query(..., description="Comma-separated asset list")):
    asset_list = [asset.strip().upper() for asset in assets.split(',')]
    results = []
    
    for asset in asset_list:
        try:
            data = await get_heatmap_data(asset)  # Your existing function
            results.append(data)
        except Exception as e:
            logger.error(f"Error fetching {asset}: {e}")
            continue
    
    return {"data": results, "count": len(results)}
```

### 3. CORS Configuration

Ensure your backend allows cross-origin requests:

```python
# In your main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 4. WebSocket Support (Optional)

For real-time updates, add WebSocket support:

```python
from fastapi import WebSocket

@app.websocket("/ws/heatmap")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    while True:
        # Send updated data every 30 seconds
        data = await get_all_heatmap_data()
        await websocket.send_json(data)
        await asyncio.sleep(30)
```

## Frontend Integration

### 1. As Standalone Application

Deploy the heatmap as a complete web application:

```bash
# Build the application
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, AWS, etc.)
```

### 2. As Embeddable Widget

#### Option A: Iframe Embedding
```html
<!-- On any website -->
<iframe 
  src="https://your-heatmap-domain.com?embedded=true"
  width="100%" 
  height="600"
  frameborder="0"
  style="border-radius: 8px;">
</iframe>
```

#### Option B: Direct Component Integration
```svelte
<!-- In a Svelte application -->
<script>
  import { HeatmapWidget } from '@your-org/edgefinder-heatmap';
</script>

<HeatmapWidget 
  apiBaseUrl="https://your-backend-api.com"
  assets={['USD', 'EUR', 'GBP', 'JPY']}
  theme="dark"
/>
```

#### Option C: NPM Package Integration
```bash
# Install the package
npm install @your-org/edgefinder-heatmap

# Use in any JavaScript framework
import { HeatmapWidget } from '@your-org/edgefinder-heatmap';
```

### 3. Configuration for Different Environments

#### Development Configuration
```javascript
const config = {
  apiBaseUrl: 'http://localhost:8000',
  assets: ['USD', 'EUR', 'GBP'],
  refreshInterval: 10000, // 10 seconds for testing
  useMockData: true,      // Use mock data during development
  theme: 'light'
};
```

#### Production Configuration
```javascript
const config = {
  apiBaseUrl: 'https://api.your-domain.com',
  assets: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'],
  refreshInterval: 30000, // 30 seconds
  useMockData: false,
  theme: 'dark',
  maxRetries: 3
};
```

## Deployment Strategies

### 1. Standalone SaaS Product

Deploy as a complete application that customers can access:

```bash
# Build for production
npm run build

# Deploy to cloud platform
# Configure custom domain: heatmap.your-domain.com
```

**Benefits:**
- Complete control over the experience
- Can implement user authentication
- Subscription-based pricing model
- Analytics and usage tracking

### 2. Embeddable Widget

Package as a widget that customers embed on their sites:

```html
<!-- Customer embeds this on their website -->
<script src="https://cdn.your-domain.com/heatmap-widget.js"></script>
<div id="heatmap-container"></div>
<script>
  new HeatmapWidget({
    container: '#heatmap-container',
    apiKey: 'customer-api-key',
    theme: 'dark'
  });
</script>
```

**Benefits:**
- Easy integration for customers
- Maintains your branding
- Can track usage per customer
- Recurring revenue model

### 3. White-label Solution

Provide the complete source code for customers to deploy themselves:

```bash
# Package the complete solution
npm run package

# Provide deployment instructions
# Customer deploys on their infrastructure
```

**Benefits:**
- Higher price point
- Customer has full control
- No ongoing hosting costs for you
- One-time licensing model

## Monitoring and Analytics

### 1. Usage Tracking

Add analytics to track component usage:

```typescript
// In your component
import { analytics } from './analytics';

onMount(() => {
  analytics.track('heatmap_loaded', {
    assets: config.assets,
    theme: config.theme,
    timestamp: new Date().toISOString()
  });
});
```

### 2. Error Monitoring

Implement error tracking:

```typescript
// In your API client
catch (error) {
  analytics.trackError('api_error', {
    endpoint: url,
    error: error.message,
    timestamp: new Date().toISOString()
  });
  throw error;
}
```

### 3. Performance Monitoring

Track component performance:

```typescript
// Track load times
const startTime = performance.now();
await loadData();
const loadTime = performance.now() - startTime;

analytics.track('heatmap_performance', {
  loadTime,
  assetCount: config.assets.length
});
```

## Security Considerations

### 1. API Key Management

For customer deployments, implement API key authentication:

```typescript
// In your API client
class HeatmapApiClient {
  constructor(config: HeatmapConfig & { apiKey?: string }) {
    this.apiKey = config.apiKey;
  }

  private async fetchWithAuth(url: string) {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return fetch(url, { headers });
  }
}
```

### 2. Rate Limiting

Implement rate limiting on your backend:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/heatmap")
@limiter.limit("60/minute")  # 60 requests per minute
async def get_heatmap(request: Request, asset: str):
    # Your existing endpoint logic
    pass
```

### 3. Data Validation

Validate all incoming requests:

```python
from pydantic import BaseModel, validator

class HeatmapRequest(BaseModel):
    asset: str
    
    @validator('asset')
    def validate_asset(cls, v):
        allowed_assets = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD']
        if v.upper() not in allowed_assets:
            raise ValueError(f'Asset {v} not supported')
        return v.upper()
```

## Testing Strategy

### 1. Component Testing

Test the heatmap component with various data scenarios:

```typescript
// tests/heatmap.test.ts
import { render } from '@testing-library/svelte';
import HeatmapWidget from '../src/lib/components/HeatmapWidget.svelte';

test('renders with mock data', () => {
  const { getByText } = render(HeatmapWidget, {
    props: {
      useMockData: true,
      assets: ['USD', 'EUR']
    }
  });
  
  expect(getByText('USD')).toBeInTheDocument();
  expect(getByText('EUR')).toBeInTheDocument();
});
```

### 2. Integration Testing

Test the complete integration with your backend:

```typescript
// tests/integration.test.ts
test('fetches real data from backend', async () => {
  const client = new HeatmapApiClient({
    apiBaseUrl: 'http://localhost:8000'
  });
  
  const data = await client.getHeatmap('USD');
  
  expect(data.asset).toBe('USD');
  expect(data.pillars).toHaveLength(3);
  expect(data.scale).toEqual([-24, 24]);
});
```

### 3. End-to-End Testing

Test the complete user experience:

```typescript
// tests/e2e.test.ts
import { test, expect } from '@playwright/test';

test('heatmap loads and displays data', async ({ page }) => {
  await page.goto('/');
  
  // Wait for data to load
  await expect(page.locator('.heatmap-table')).toBeVisible();
  
  // Check that assets are displayed
  await expect(page.locator('.asset-name')).toContainText('USD');
  
  // Test refresh functionality
  await page.click('.refresh-btn');
  await expect(page.locator('.loading-spinner')).toBeVisible();
});
```

This integration guide provides a complete roadmap for deploying your EdgeFinder heatmap as a standalone product while maintaining seamless integration with your existing backend scraper system.
