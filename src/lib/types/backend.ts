// Backend API Types - Compatible with your scraper system
export interface Component {
	key: string;
	score: number;
}

export interface Pillar {
	name: string;
	score: number;
	components: Component[];
}

export interface HeatmapResponse {
	asset: string;
	score: number;
	scale: [number, number];
	pillars: Pillar[];
	as_of: string;
	version: string;
}

// Frontend Display Types - EdgeFinder compatible
export interface HeatmapAsset {
	asset: string;
	bias: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish';
	score: number;
	sentiment: Record<string, number>;
	technical: Record<string, number>;
	economic: Record<string, number>;
	lastUpdated: Date;
}

export interface HeatmapConfig {
	apiBaseUrl: string;
	refreshInterval?: number;
	assets: string[];
	theme?: 'light' | 'dark';
	showHeader?: boolean;
	showControls?: boolean;
	maxRetries?: number;
}

export interface HeatmapState {
	data: HeatmapAsset[];
	loading: boolean;
	error: string | null;
	lastUpdated: Date | null;
}

// API Client Types
export interface ApiClient {
	getHeatmap(asset: string): Promise<HeatmapResponse>;
	getMultipleHeatmaps(assets: string[]): Promise<HeatmapResponse[]>;
}

// Utility Types
export type ScoreRange = -2 | -1 | 0 | 1 | 2;
export type PillarType = 'sentiment' | 'technical' | 'economic';

// Color mapping for EdgeFinder style
export const SCORE_COLORS = {
	'-2': 'bg-red-600 text-white',
	'-1': 'bg-red-300 text-red-900',
	'0': 'bg-gray-200 text-gray-700',
	'1': 'bg-blue-300 text-blue-900',
	'2': 'bg-blue-600 text-white'
} as const;

export const BIAS_COLORS = {
	'Very Bullish': 'bg-green-600 text-white',
	'Bullish': 'bg-green-400 text-green-900',
	'Neutral': 'bg-gray-400 text-gray-900',
	'Bearish': 'bg-red-400 text-red-900',
	'Very Bearish': 'bg-red-600 text-white'
} as const;

// Data transformation utilities
export function normalizeScore(score: number, scale: [number, number]): ScoreRange {
	const [min, max] = scale;
	const normalized = (score - min) / (max - min);
	
	if (normalized <= 0.1) return -2;
	if (normalized <= 0.3) return -1;
	if (normalized <= 0.7) return 0;
	if (normalized <= 0.9) return 1;
	return 2;
}

export function getBias(score: number): HeatmapAsset['bias'] {
	if (score >= 15) return 'Very Bullish';
	if (score >= 8) return 'Bullish';
	if (score >= -7) return 'Neutral';
	if (score >= -15) return 'Bearish';
	return 'Very Bearish';
}

export function transformBackendResponse(response: HeatmapResponse): HeatmapAsset {
	const sentiment: Record<string, number> = {};
	const technical: Record<string, number> = {};
	const economic: Record<string, number> = {};

	response.pillars.forEach(pillar => {
		pillar.components.forEach(component => {
			const normalizedScore = normalizeScore(component.score, response.scale);
			
			switch (pillar.name.toLowerCase()) {
				case 'sentiment':
					sentiment[component.key] = normalizedScore;
					break;
				case 'technical':
					technical[component.key] = normalizedScore;
					break;
				case 'economic':
					economic[component.key] = normalizedScore;
					break;
			}
		});
	});

	return {
		asset: response.asset,
		bias: getBias(response.score),
		score: response.score,
		sentiment,
		technical,
		economic,
		lastUpdated: new Date(response.as_of)
	};
}
