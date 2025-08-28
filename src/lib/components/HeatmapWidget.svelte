<script lang="ts">
	import EdgeFinderHeatmap from './EdgeFinderHeatmap.svelte';
	import type { HeatmapConfig } from '../types/backend.js';

	// Widget configuration - can be passed from parent or set via props
	export let apiBaseUrl = 'http://localhost:8000';
	export let assets = ['USOIL', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
	export let refreshInterval = 30000; // 30 seconds
	export let theme: 'light' | 'dark' = 'light';
	export let showHeader = true;
	export let showControls = true;
	export let useMockData = false;
	export let maxRetries = 3;

	// Build configuration object
	$: config: HeatmapConfig = {
		apiBaseUrl,
		assets,
		refreshInterval,
		theme,
		showHeader,
		showControls,
		maxRetries
	};
</script>

<!-- 
	HeatmapWidget - Embeddable wrapper for EdgeFinderHeatmap
	
	This component provides a simple interface for embedding the heatmap
	in external websites or applications. It handles configuration and
	provides sensible defaults.
	
	Usage:
	<HeatmapWidget 
		apiBaseUrl="https://your-api.com"
		assets={['USD', 'EUR', 'GBP']}
		theme="dark"
	/>
-->

<div class="heatmap-widget">
	<EdgeFinderHeatmap {config} {useMockData} />
</div>

<style>
	.heatmap-widget {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	/* Ensure the widget fills its container */
	:global(.heatmap-widget .edgefinder-heatmap) {
		flex: 1;
		height: 100%;
	}

	/* Widget-specific responsive adjustments */
	@media (max-width: 1024px) {
		.heatmap-widget {
			font-size: 14px;
		}
	}

	@media (max-width: 768px) {
		.heatmap-widget {
			font-size: 12px;
		}
	}

	@media (max-width: 480px) {
		.heatmap-widget {
			font-size: 10px;
		}
	}
</style>
