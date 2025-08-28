import type { ApiClient, HeatmapResponse, HeatmapConfig } from '../types/backend.js';

export class HeatmapApiClient implements ApiClient {
	private baseUrl: string;
	private maxRetries: number;

	constructor(config: Pick<HeatmapConfig, 'apiBaseUrl' | 'maxRetries'>) {
		this.baseUrl = config.apiBaseUrl.replace(/\/$/, '');
		this.maxRetries = config.maxRetries || 3;
	}

	async getHeatmap(asset: string): Promise<HeatmapResponse> {
		const url = `${this.baseUrl}/heatmap?asset=${encodeURIComponent(asset)}`;
		return this.fetchWithRetry(url);
	}

	async getMultipleHeatmaps(assets: string[]): Promise<HeatmapResponse[]> {
		const promises = assets.map(asset => this.getHeatmap(asset));
		const results = await Promise.allSettled(promises);
		
		return results
			.filter((result): result is PromiseFulfilledResult<HeatmapResponse> => 
				result.status === 'fulfilled'
			)
			.map(result => result.value);
	}

	private async fetchWithRetry(url: string, retries = 0): Promise<HeatmapResponse> {
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			return this.validateResponse(data);
		} catch (error) {
			if (retries < this.maxRetries) {
				await this.delay(Math.pow(2, retries) * 1000);
				return this.fetchWithRetry(url, retries + 1);
			}
			throw error;
		}
	}

	private validateResponse(data: any): HeatmapResponse {
		if (!data || typeof data !== 'object') {
			throw new Error('Invalid response format');
		}

		const required = ['asset', 'score', 'scale', 'pillars', 'as_of', 'version'];
		for (const field of required) {
			if (!(field in data)) {
				throw new Error(`Missing required field: ${field}`);
			}
		}

		if (!Array.isArray(data.pillars)) {
			throw new Error('Pillars must be an array');
		}

		if (!Array.isArray(data.scale) || data.scale.length !== 2) {
			throw new Error('Scale must be a tuple of two numbers');
		}

		return data as HeatmapResponse;
	}

	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

// Mock client for development/testing
export class MockApiClient implements ApiClient {
	private mockData: Record<string, HeatmapResponse> = {
		'USOIL': {
			asset: 'USOIL',
			score: 13,
			scale: [-24, 24],
			pillars: [
				{
					name: 'sentiment',
					score: 4,
					components: [
						{ key: 'cot', score: 2 },
						{ key: 'retailPos', score: 2 }
					]
				},
				{
					name: 'technical',
					score: 3,
					components: [
						{ key: 'seasonality', score: 1 },
						{ key: 'trend', score: 2 }
					]
				},
				{
					name: 'economic',
					score: 6,
					components: [
						{ key: 'gdp', score: 1 },
						{ key: 'mPMI', score: 1 },
						{ key: 'sPMI', score: 1 },
						{ key: 'retailSales', score: 1 },
						{ key: 'inflation', score: 1 },
						{ key: 'employmentChange', score: 1 }
					]
				}
			],
			as_of: new Date().toISOString(),
			version: '2025.08.1'
		},
		'USD': {
			asset: 'USD',
			score: 10,
			scale: [-24, 24],
			pillars: [
				{
					name: 'sentiment',
					score: 3,
					components: [
						{ key: 'cot', score: 1 },
						{ key: 'retailPos', score: 2 }
					]
				},
				{
					name: 'technical',
					score: 3,
					components: [
						{ key: 'seasonality', score: 1 },
						{ key: 'trend', score: 2 }
					]
				},
				{
					name: 'economic',
					score: 4,
					components: [
						{ key: 'gdp', score: 1 },
						{ key: 'mPMI', score: 1 },
						{ key: 'sPMI', score: 1 },
						{ key: 'inflation', score: 1 }
					]
				}
			],
			as_of: new Date().toISOString(),
			version: '2025.08.1'
		},
		'EUR': {
			asset: 'EUR',
			score: -4,
			scale: [-24, 24],
			pillars: [
				{
					name: 'sentiment',
					score: -1,
					components: [
						{ key: 'cot', score: -1 },
						{ key: 'retailPos', score: 0 }
					]
				},
				{
					name: 'technical',
					score: -1,
					components: [
						{ key: 'seasonality', score: -1 },
						{ key: 'trend', score: 0 }
					]
				},
				{
					name: 'economic',
					score: -2,
					components: [
						{ key: 'gdp', score: -1 },
						{ key: 'retailSales', score: -1 }
					]
				}
			],
			as_of: new Date().toISOString(),
			version: '2025.08.1'
		}
	};

	async getHeatmap(asset: string): Promise<HeatmapResponse> {
		await this.delay(100 + Math.random() * 200);
		
		if (!(asset in this.mockData)) {
			throw new Error(`Asset ${asset} not found`);
		}
		
		return { ...this.mockData[asset] };
	}

	async getMultipleHeatmaps(assets: string[]): Promise<HeatmapResponse[]> {
		const promises = assets.map(asset => this.getHeatmap(asset));
		const results = await Promise.allSettled(promises);
		
		return results
			.filter((result): result is PromiseFulfilledResult<HeatmapResponse> => 
				result.status === 'fulfilled'
			)
			.map(result => result.value);
	}

	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}
