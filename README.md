# EdgeFinder Heatmap - Standalone Currency Strength Component

A professional, standalone Svelte component that replicates the EdgeFinder "Top Setups" heatmap design for currency strength analysis. Perfect for trading websites and financial applications.

## Features

- 🎯 **Exact EdgeFinder Design**: Matches the professional "Top Setups" layout
- 🔄 **Real-time Data**: Integrates seamlessly with your backend scraper
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- 🎨 **Themeable**: Light/dark mode support
- 🔌 **Embeddable**: Can be integrated into any website
- 📦 **Standalone**: Works as independent component or full application
- 🚀 **Performance**: Optimized for real-time trading data

## Quick Start

### Installation

```bash
npm install @your-org/edgefinder-heatmap
```

### Basic Usage

```svelte
<script>
  import { HeatmapWidget } from '@your-org/edgefinder-heatmap';
</script>

<HeatmapWidget 
  apiBaseUrl="https://your-api.com"
  assets={['USD', 'EUR', 'GBP', 'JPY']}
/>
```

### Advanced Configuration

```svelte
<script>
  import { HeatmapWidget } from '@your-org/edgefinder-heatmap';
</script>

<HeatmapWidget 
  apiBaseUrl="https://your-api.com"
  assets={['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD']}
  theme="dark"
  refreshInterval={30000}
  showHeader={true}
  showControls={true}
  maxRetries={3}
/>
```

## Backend Integration

This component is designed to work with your existing backend scraper system. It expects the following API structure:

### API Endpoint

```
GET /heatmap?asset={SYMBOL}
```

### Expected Response Format

```json
{
  "asset": "USD",
  "score": 10,
  "scale": [-24, 24],
  "pillars": [
    {
      "name": "sentiment",
      "score": 3,
      "components": [
        {"key": "cot", "score": 1},
        {"key": "retailPos", "score": 2}
      ]
    },
    {
      "name": "technical", 
      "score": 3,
      "components": [
        {"key": "seasonality", "score": 1},
        {"key": "trend", "score": 2}
      ]
    },
    {
      "name": "economic",
      "score": 4,
      "components": [
        {"key": "gdp", "score": 1},
        {"key": "inflation", "score": 1}
      ]
    }
  ],
  "as_of": "2025-08-28T10:30:00Z",
  "version": "2025.08.1"
}
```

## Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `apiBaseUrl` | string | Required | Your backend API base URL |
| `assets` | string[] | Required | Array of currency/asset symbols |
| `refreshInterval` | number | 30000 | Auto-refresh interval in milliseconds |
| `theme` | 'light' \| 'dark' | 'light' | Visual theme |
| `showHeader` | boolean | true | Show/hide header section |
| `showControls` | boolean | true | Show/hide control buttons |
| `useMockData` | boolean | false | Use mock data for testing |
| `maxRetries` | number | 3 | API retry attempts |

## Embedding Options

### 1. As Svelte Component

```svelte
<script>
  import { HeatmapWidget } from '@your-org/edgefinder-heatmap';
</script>

<HeatmapWidget {config} />
```

### 2. As Iframe

```html
<iframe 
  src="https://your-heatmap-domain.com" 
  width="100%" 
  height="600"
  frameborder="0">
</iframe>
```

### 3. As Web Component (Future)

```html
<edgefinder-heatmap 
  api-base-url="https://your-api.com"
  assets="USD,EUR,GBP,JPY"
  theme="dark">
</edgefinder-heatmap>
```

## Development

### Setup

```bash
git clone https://github.com/your-username/edgefinder-heatmap.git
cd edgefinder-heatmap
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Package for Distribution

```bash
npm run package
```

## Backend Scraper Compatibility

This component is specifically designed to work with your backend scraper system:

- ✅ **Compatible with existing API structure**
- ✅ **Handles your pillar-based scoring system**
- ✅ **Supports your component breakdown**
- ✅ **Works with your scale (-24 to +24)**
- ✅ **Integrates with your asset symbols**

### Recommended Backend Modifications

For optimal performance, consider these enhancements to your scraper:

1. **Batch Endpoint**: Add `/heatmap/batch?assets=USD,EUR,GBP` for multiple assets
2. **WebSocket Support**: Real-time updates via WebSocket connection
3. **Caching**: Implement Redis caching for frequently requested data
4. **CORS Headers**: Ensure proper CORS configuration for web embedding

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-username/edgefinder-heatmap/issues)
- Documentation: [Full docs](https://your-docs-site.com)
- Email: your-email@domain.com
