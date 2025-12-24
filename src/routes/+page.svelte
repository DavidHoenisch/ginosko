<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import ChatInterface from './ChatInterface.svelte';

	let showChat = $state(false);
</script>

{#if !showChat}
	<div class="min-h-screen bg-background flex flex-col items-center justify-center p-4">
		<div class="max-w-4xl w-full text-center space-y-8">
			<div class="space-y-4">
				<h1 class="text-4xl font-bold text-foreground">Chat with Jane Austen</h1>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					Explore the world of Jane Austen's novels through conversation. Ask questions about her characters,
					plots, themes, and insights from works like Pride and Prejudice and Sense and Sensibility.
				</p>
			</div>

			<div class="space-y-4">
				<Button
					size="lg"
					onclick={() => showChat = true}
					class="px-8 py-3 text-lg"
				>
					Start Chatting
				</Button>

				<p class="text-sm text-muted-foreground">
					Powered by AI and Jane Austen's timeless literature
				</p>
			</div>
		</div>
	</div>
{:else}
	<ChatInterface onClose={() => showChat = false} />
{/if}
