<script lang="ts">
	import { onMount } from 'svelte';
	import HeatmapWidget from '$lib/components/HeatmapWidget.svelte';

	let useMockData = true;
	let theme: 'light' | 'dark' = 'light';
	let apiBaseUrl = 'http://localhost:8000';
	let refreshInterval = 30000;

	// Demo configuration
	const demoAssets = ['USOIL', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

	onMount(() => {
		// Check if we're in development mode
		const isDev = window.location.hostname === 'localhost';
		if (!isDev) {
			// In production, try to use real API
			useMockData = false;
		}
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
	}

	function toggleDataSource() {
		useMockData = !useMockData;
	}
</script>

<svelte:head>
	<title>EdgeFinder Heatmap Demo</title>
</svelte:head>

<main class="demo-container" class:dark={theme === 'dark'}>
	<div class="demo-header">
		<h1>EdgeFinder Heatmap Demo</h1>
		<p>Professional currency strength analysis for trading</p>
		
		<div class="demo-controls">
			<button class="control-btn" on:click={toggleTheme}>
				{theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'} Mode
			</button>
			
			<button class="control-btn" on:click={toggleDataSource}>
				{useMockData ? '🔗' : '🎭'} {useMockData ? 'Live Data' : 'Mock Data'}
			</button>
		</div>
	</div>

	<div class="heatmap-container">
		<HeatmapWidget 
			{apiBaseUrl}
			assets={demoAssets}
			{refreshInterval}
			{theme}
			{useMockData}
			showHeader={true}
			showControls={true}
		/>
	</div>

	<div class="demo-footer">
		<div class="integration-info">
			<h3>Integration Examples</h3>
			<div class="code-examples">
				<div class="code-example">
					<h4>Basic Usage</h4>
					<pre><code>&lt;HeatmapWidget 
  apiBaseUrl="https://your-api.com"
  assets={['USD', 'EUR', 'GBP']}
/&gt;</code></pre>
				</div>
				
				<div class="code-example">
					<h4>Custom Configuration</h4>
					<pre><code>&lt;HeatmapWidget 
  apiBaseUrl="https://your-api.com"
  assets={['USD', 'EUR', 'GBP', 'JPY']}
  theme="dark"
  refreshInterval={60000}
  showHeader={false}
/&gt;</code></pre>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	.demo-container {
		min-height: 100vh;
		background: #f8fafc;
		transition: all 0.3s ease;
	}

	.demo-container.dark {
		background: #0f172a;
		color: #ffffff;
	}

	.demo-header {
		padding: 2rem;
		text-align: center;
		border-bottom: 1px solid #e2e8f0;
	}

	.demo-container.dark .demo-header {
		border-bottom-color: #334155;
	}

	.demo-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2.5rem;
		font-weight: 700;
		color: #1e293b;
	}

	.demo-container.dark .demo-header h1 {
		color: #ffffff;
	}

	.demo-header p {
		margin: 0 0 2rem 0;
		font-size: 1.1rem;
		color: #64748b;
	}

	.demo-container.dark .demo-header p {
		color: #94a3b8;
	}

	.demo-controls {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.control-btn {
		padding: 0.75rem 1.5rem;
		border: 1px solid #d1d5db;
		background: #ffffff;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.control-btn:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.demo-container.dark .control-btn {
		background: #374151;
		border-color: #4b5563;
		color: #ffffff;
	}

	.demo-container.dark .control-btn:hover {
		background: #4b5563;
	}

	.heatmap-container {
		padding: 2rem;
		max-width: 100%;
		margin: 0 auto;
	}

	.demo-footer {
		padding: 2rem;
		border-top: 1px solid #e2e8f0;
		background: #ffffff;
	}

	.demo-container.dark .demo-footer {
		background: #1e293b;
		border-top-color: #334155;
	}

	.integration-info h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		color: #1e293b;
		text-align: center;
	}

	.demo-container.dark .integration-info h3 {
		color: #ffffff;
	}

	.code-examples {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.code-example h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #374151;
	}

	.demo-container.dark .code-example h4 {
		color: #d1d5db;
	}

	.code-example pre {
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.85rem;
		line-height: 1.5;
	}

	.demo-container.dark .code-example pre {
		background: #0f172a;
		border-color: #334155;
		color: #e2e8f0;
	}

	.code-example code {
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	@media (max-width: 768px) {
		.demo-header {
			padding: 1rem;
		}

		.demo-header h1 {
			font-size: 2rem;
		}

		.heatmap-container {
			padding: 1rem;
		}

		.demo-footer {
			padding: 1rem;
		}

		.code-examples {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.code-example {
			min-width: 0;
		}
	}
</style>
