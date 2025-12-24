<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';

	interface Message {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		sources?: Array<{
			content: string;
			metadata: any;
			similarity?: number;
		}>;
		timestamp: Date;
	}

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let messages: Message[] = $state([]);
	let inputMessage = $state('');
	let isLoading = $state(false);
	let chatContainer: HTMLElement;

	async function sendMessage() {
		if (!inputMessage.trim() || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: inputMessage.trim(),
			timestamp: new Date()
		};

		messages = [...messages, userMessage];
		const currentInput = inputMessage;
		inputMessage = '';
		isLoading = true;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: currentInput })
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const data = await response.json();

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: data.response,
				sources: data.sources,
				timestamp: new Date()
			};

			messages = [...messages, assistantMessage];
		} catch (error) {
			console.error('Error sending message:', error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: 'Sorry, I encountered an error while processing your question. Please try again.',
				timestamp: new Date()
			};
			messages = [...messages, errorMessage];
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).catch(err => {
			console.error('Failed to copy text: ', err);
		});
	}

	onMount(() => {
		// Scroll to bottom when new messages arrive
		$effect(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		});
	});
</script>

<div class="fixed inset-0 bg-background z-50 flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between p-4 border-b border-border">
		<div class="flex items-center space-x-3">
			<Button variant="ghost" size="sm" onclick={onClose}>
				← Back
			</Button>
			<h2 class="text-lg font-semibold">Chat with Jane Austen</h2>
		</div>
		<Button variant="ghost" size="sm" onclick={onClose}>
			✕
		</Button>
	</div>

	<!-- Messages -->
	<div
		bind:this={chatContainer}
		class="flex-1 overflow-y-auto p-4 space-y-4"
	>
		{#if messages.length === 0}
			<div class="flex items-center justify-center h-full">
				<div class="text-center text-muted-foreground max-w-md">
					<p class="text-lg mb-2">Ask me about Jane Austen's novels</p>
					<p class="text-sm">Pride and Prejudice, Sense and Sensibility, and more...</p>
				</div>
			</div>
		{/if}

		{#each messages as message (message.id)}
			<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
				{#if message.role === 'user'}
					<div class="max-w-[70%] bg-primary text-primary-foreground rounded-2xl px-4 py-3">
						<p class="text-sm">{message.content}</p>
					</div>
				{:else}
					<div class="max-w-[80%]">
						<div class="bg-muted rounded-2xl px-4 py-3 group relative">
							<button
								class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background rounded-full p-1 text-xs"
								onclick={() => copyToClipboard(message.content)}
								title="Copy"
							>
								📋
							</button>
							<p class="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
						</div>

						{#if message.sources && message.sources.length > 0}
							<div class="mt-2 space-y-1">
								{#each message.sources as source}
									<details class="text-xs">
										<summary class="cursor-pointer text-muted-foreground hover:text-foreground">
											{source.metadata?.title || 'Source'}{#if source.similarity} · {(source.similarity * 100).toFixed(0)}% match{/if}
										</summary>
										<div class="mt-1 pl-4 text-muted-foreground italic border-l-2 border-border">
											"{source.content}"
										</div>
									</details>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/each}

		{#if isLoading}
			<div class="flex justify-start">
				<div class="bg-muted rounded-2xl px-4 py-3">
					<div class="flex space-x-1">
						<div class="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></div>
						<div class="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
						<div class="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Input -->
	<div class="p-4 border-t border-border">
		<div class="max-w-4xl mx-auto flex items-end gap-2">
			<textarea
				bind:value={inputMessage}
				onkeydown={handleKeyPress}
				placeholder="Ask about Jane Austen's works..."
				class="flex-1 min-h-[44px] max-h-32 resize-none rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
				rows="1"
				disabled={isLoading}
			></textarea>
			<Button
				onclick={sendMessage}
				disabled={!inputMessage.trim() || isLoading}
				class="h-11 px-6"
			>
				Send
			</Button>
		</div>
	</div>
</div>