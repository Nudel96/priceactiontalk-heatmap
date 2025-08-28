// Main exports for the standalone heatmap library
export { default as EdgeFinderHeatmap } from './components/EdgeFinderHeatmap.svelte';
export { default as HeatmapWidget } from './components/HeatmapWidget.svelte';

// API client exports
export { HeatmapApiClient, MockApiClient } from './api/client.js';

// Type exports
export type {
	HeatmapConfig,
	HeatmapState,
	HeatmapAsset,
	HeatmapResponse,
	ApiClient,
	Component,
	Pillar,
	ScoreRange,
	PillarType
} from './types/backend.js';

// Utility exports
export {
	SCORE_COLORS,
	BIAS_COLORS,
	normalizeScore,
	getBias,
	transformBackendResponse
} from './types/backend.js';
