<script>
	import { supabase } from '$lib/supabaseClient';

	let category = 'Bug';
	let message = '';
	let email = '';
	let submitted = false;
	let error = '';

	async function submitReport() {
		error = '';
		if (!message.trim()) {
			error = 'Please provide details for your report.';
			return;
		}

		const { error: insertError } = await supabase.from('reports').insert([
			{
				category,
				message,
				email
			}
		]);

		if (insertError) {
			error = insertError.message;
			return;
		}

		submitted = true;
		message = '';
		email = '';
		category = 'Bug';
	}
</script>

<section class="min-h-screen bg-black text-white px-6 py-24">
	<div class="max-w-2xl mx-auto space-y-8">
		<h1 class="text-4xl font-bold text-center">Report a Problem</h1>
		<p class="text-center text-gray-400">
			Found a bug, issue, or something that doesn't feel right? Let us know.
		</p>

		{#if submitted}
			<div class="bg-green-700/20 border border-green-600 rounded-lg p-4 text-green-300">
				✅ Thank you for your feedback! We'll look into this as soon as possible.
			</div>
		{:else}
			{#if error}
				<div class="bg-red-700/20 border border-red-600 rounded-lg p-4 text-red-300">
					⚠️ {error}
				</div>
			{/if}

			<div class="space-y-6">
				<!-- Category -->
				<div>
					<label class="text-sm text-gray-300 block mb-1">Category</label>
					<select
						bind:value={category}
						class="bg-neutral-800 text-white px-4 py-2 rounded-lg w-full"
					>
						<option>Bug</option>
						<option>Feature Request</option>
						<option>Content Issue</option>
						<option>Abuse or Inappropriate Behavior</option>
						<option>Other</option>
					</select>
				</div>

				<!-- Message -->
				<div>
					<label class="text-sm text-gray-300 block mb-1">Message</label>
					<textarea
						bind:value={message}
						class="bg-neutral-800 text-white px-4 py-2 rounded-lg w-full min-h-[150px]"
						placeholder="Describe the issue, feature, or concern in detail…"
					></textarea>
				</div>

				<!-- Optional email -->
				<div>
					<label class="text-sm text-gray-300 block mb-1">Your email (optional)</label>
					<input
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						class="bg-neutral-800 text-white px-4 py-2 rounded-lg w-full"
					/>
				</div>

				<!-- Submit -->
				<button
					on:click={submitReport}
					class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
				>
					Submit Report
				</button>
			</div>
		{/if}
	</div>
</section>
