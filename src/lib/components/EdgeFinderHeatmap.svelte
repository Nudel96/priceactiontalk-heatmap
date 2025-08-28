<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import type { 
		HeatmapConfig, 
		HeatmapState, 
		HeatmapAsset, 
		ApiClient,
		ScoreRange 
	} from '../types/backend.js';
	import { 
		SCORE_COLORS, 
		BIAS_COLORS, 
		transformBackendResponse 
	} from '../types/backend.js';
	import { HeatmapApiClient, MockApiClient } from '../api/client.js';

	// Props
	export let config: HeatmapConfig;
	export let useMockData = false;

	// State
	const state = writable<HeatmapState>({
		data: [],
		loading: true,
		error: null,
		lastUpdated: null
	});

	let apiClient: ApiClient;
	let refreshInterval: number | null = null;

	// Initialize API client
	$: {
		apiClient = useMockData 
			? new MockApiClient() 
			: new HeatmapApiClient(config);
	}

	// Reactive data sorting
	$: sortedData = $state.data.sort((a, b) => b.score - a.score);

	// Component lifecycle
	onMount(() => {
		loadData();
		if (config.refreshInterval && config.refreshInterval > 0) {
			refreshInterval = setInterval(loadData, config.refreshInterval);
		}
	});

	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
	});

	async function loadData() {
		state.update(s => ({ ...s, loading: true, error: null }));

		try {
			const responses = await apiClient.getMultipleHeatmaps(config.assets);
			const transformedData = responses.map(transformBackendResponse);
			
			state.update(s => ({
				...s,
				data: transformedData,
				loading: false,
				lastUpdated: new Date()
			}));
		} catch (error) {
			state.update(s => ({
				...s,
				loading: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			}));
		}
	}

	function getCellColor(value: number): string {
		const key = String(value) as keyof typeof SCORE_COLORS;
		return SCORE_COLORS[key] || SCORE_COLORS['0'];
	}

	function getBiasColor(bias: HeatmapAsset['bias']): string {
		return BIAS_COLORS[bias];
	}

	function formatScore(score: number): string {
		return score > 0 ? `+${score}` : String(score);
	}

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
	}

	// Get all unique component keys for column headers
	$: sentimentKeys = [...new Set(sortedData.flatMap(item => Object.keys(item.sentiment)))];
	$: technicalKeys = [...new Set(sortedData.flatMap(item => Object.keys(item.technical)))];
	$: economicKeys = [...new Set(sortedData.flatMap(item => Object.keys(item.economic)))];
</script>

<div class="edgefinder-heatmap" class:dark={config.theme === 'dark'}>
	{#if config.showHeader !== false}
		<div class="heatmap-header">
			<div class="header-title">
				<h2>Top Setups</h2>
				<span class="subtitle">Currency Strength Analysis</span>
			</div>

			{#if config.showControls !== false}
				<div class="header-controls">
					{#if $state.lastUpdated}
						<span class="last-updated">
							Last updated: {formatTime($state.lastUpdated)}
						</span>
					{/if}
					<button
						class="refresh-btn"
						on:click={loadData}
						disabled={$state.loading}
					>
						{$state.loading ? '⟳' : '↻'} Refresh
					</button>
				</div>
			{/if}
		</div>
	{/if}

	{#if $state.error}
		<div class="error-message">
			<span class="error-icon">⚠</span>
			<span>Error loading data: {$state.error}</span>
			<button class="retry-btn" on:click={loadData}>Retry</button>
		</div>
	{:else}
		<div class="heatmap-table-container">
			<table class="heatmap-table">
				<thead>
					<!-- Main headers -->
					<tr class="main-headers">
						<th rowspan="2" class="asset-header">Asset</th>
						<th rowspan="2" class="bias-header">Bias</th>
						<th rowspan="2" class="score-header">Score</th>

						{#if sentimentKeys.length > 0}
							<th colspan={sentimentKeys.length} class="pillar-header sentiment">
								Sentiment
							</th>
						{/if}

						{#if technicalKeys.length > 0}
							<th colspan={technicalKeys.length} class="pillar-header technical">
								Technical
							</th>
						{/if}

						{#if economicKeys.length > 0}
							<th colspan={economicKeys.length} class="pillar-header economic">
								Economic
							</th>
						{/if}
					</tr>

					<!-- Sub headers -->
					<tr class="sub-headers">
						{#each sentimentKeys as key}
							<th class="component-header sentiment">{key}</th>
						{/each}
						{#each technicalKeys as key}
							<th class="component-header technical">{key}</th>
						{/each}
						{#each economicKeys as key}
							<th class="component-header economic">{key}</th>
						{/each}
					</tr>
				</thead>

				<tbody>
					{#if $state.loading && sortedData.length === 0}
						<tr>
							<td colspan="100%" class="loading-cell">
								<div class="loading-spinner">⟳</div>
								Loading data...
							</td>
						</tr>
					{:else}
						{#each sortedData as item}
							<tr class="data-row">
								<td class="asset-cell">
									<span class="asset-name">{item.asset}</span>
								</td>

								<td class="bias-cell">
									<span class="bias-badge {getBiasColor(item.bias)}">
										{item.bias}
									</span>
								</td>

								<td class="score-cell">
									<span class="score-value" class:positive={item.score > 0} class:negative={item.score < 0}>
										{formatScore(item.score)}
									</span>
								</td>

								{#each sentimentKeys as key}
									<td class="component-cell sentiment">
										<span class="component-value {getCellColor(item.sentiment[key] || 0)}">
											{item.sentiment[key] || 0}
										</span>
									</td>
								{/each}

								{#each technicalKeys as key}
									<td class="component-cell technical">
										<span class="component-value {getCellColor(item.technical[key] || 0)}">
											{item.technical[key] || 0}
										</span>
									</td>
								{/each}

								{#each economicKeys as key}
									<td class="component-cell economic">
										<span class="component-value {getCellColor(item.economic[key] || 0)}">
											{item.economic[key] || 0}
										</span>
									</td>
								{/each}
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.edgefinder-heatmap {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: #ffffff;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		width: 100%;
		max-width: 100%;
	}

	.edgefinder-heatmap.dark {
		background: #1a1a1a;
		color: #ffffff;
	}

	.heatmap-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.dark .heatmap-header {
		background: #2d2d2d;
		border-bottom-color: #404040;
	}

	.header-title h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #111827;
	}

	.dark .header-title h2 {
		color: #ffffff;
	}

	.subtitle {
		font-size: 12px;
		color: #6b7280;
		margin-top: 2px;
		display: block;
	}

	.dark .subtitle {
		color: #9ca3af;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.last-updated {
		font-size: 12px;
		color: #6b7280;
	}

	.dark .last-updated {
		color: #9ca3af;
	}

	.refresh-btn, .retry-btn {
		padding: 6px 12px;
		border: 1px solid #d1d5db;
		background: #ffffff;
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.refresh-btn:hover, .retry-btn:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.refresh-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.dark .refresh-btn, .dark .retry-btn {
		background: #374151;
		border-color: #4b5563;
		color: #ffffff;
	}

	.dark .refresh-btn:hover, .dark .retry-btn:hover {
		background: #4b5563;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 16px 20px;
		background: #fef2f2;
		color: #dc2626;
		border-left: 4px solid #dc2626;
	}

	.dark .error-message {
		background: #2d1b1b;
		color: #f87171;
	}

	.heatmap-table-container {
		overflow-x: auto;
		max-width: 100%;
	}

	.heatmap-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 12px;
		min-width: 800px;
	}

	.heatmap-table th,
	.heatmap-table td {
		padding: 8px 6px;
		text-align: center;
		border: 1px solid #e5e7eb;
		white-space: nowrap;
	}

	.dark .heatmap-table th,
	.dark .heatmap-table td {
		border-color: #404040;
	}

	.main-headers th {
		background: #f3f4f6;
		font-weight: 600;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.dark .main-headers th {
		background: #374151;
		color: #ffffff;
	}

	.pillar-header.sentiment {
		background: #fef2f2 !important;
		color: #dc2626 !important;
	}

	.pillar-header.technical {
		background: #eff6ff !important;
		color: #2563eb !important;
	}

	.pillar-header.economic {
		background: #f3e8ff !important;
		color: #7c3aed !important;
	}

	.dark .pillar-header.sentiment {
		background: #2d1b1b !important;
		color: #f87171 !important;
	}

	.dark .pillar-header.technical {
		background: #1e293b !important;
		color: #60a5fa !important;
	}

	.dark .pillar-header.economic {
		background: #2d1b2d !important;
		color: #a78bfa !important;
	}

	.sub-headers th {
		background: #f9fafb;
		font-size: 10px;
		font-weight: 500;
	}

	.dark .sub-headers th {
		background: #2d2d2d;
	}

	.component-header.sentiment {
		background: #fef2f2 !important;
		color: #991b1b !important;
	}

	.component-header.technical {
		background: #eff6ff !important;
		color: #1d4ed8 !important;
	}

	.component-header.economic {
		background: #f3e8ff !important;
		color: #6b21a8 !important;
	}

	.data-row:nth-child(even) {
		background: #f9fafb;
	}

	.dark .data-row:nth-child(even) {
		background: #2d2d2d;
	}

	.data-row:hover {
		background: #f3f4f6;
	}

	.dark .data-row:hover {
		background: #374151;
	}

	.asset-name {
		font-weight: 600;
		color: #111827;
	}

	.dark .asset-name {
		color: #ffffff;
	}

	.bias-badge {
		padding: 2px 6px;
		border-radius: 12px;
		font-size: 10px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.score-value {
		font-weight: 600;
		font-size: 13px;
	}

	.score-value.positive {
		color: #059669;
	}

	.score-value.negative {
		color: #dc2626;
	}

	.component-value {
		display: inline-block;
		padding: 2px 6px;
		border-radius: 3px;
		font-weight: 500;
		min-width: 20px;
	}

	.loading-cell {
		text-align: center;
		padding: 40px;
		color: #6b7280;
	}

	.loading-spinner {
		display: inline-block;
		animation: spin 1s linear infinite;
		margin-right: 8px;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.heatmap-header {
			flex-direction: column;
			gap: 12px;
			align-items: flex-start;
		}

		.header-controls {
			width: 100%;
			justify-content: space-between;
		}

		.heatmap-table {
			font-size: 10px;
		}

		.heatmap-table th,
		.heatmap-table td {
			padding: 4px 3px;
		}
	}
</style>
