<script lang="ts">
  import { page } from "$app/state";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { getContext, hasContext } from "svelte";

  let { onCancel, reported } = $props();

  // then simply coerce to boolean
  const user = hasContext("user")
    ? /** @type {User} */ (getContext("user"))
    : null;

  // then simply coerce to boolean
  const isConnected: boolean = user !== null;

  // which tab: 'bug' or 'feature'
  let currentTab = $state<"bug" | "feature">("bug");

  // common submission state
  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  // Bug report state
  let bug: {
    title: string;
    steps: string;
    expected: string;
    actual: string;
    deviceType: string;
    os: string;
    browser: string;
    imageUrl: string;
    extra: string;
  } = $state({
    title: "",
    steps: "",
    expected: "",
    actual: "",
    deviceType: "Desktop",
    os: "",
    browser: "",
    imageUrl: "",
    extra: "",
  });

  import { onMount } from "svelte";
  onMount(() => {
    const url = new URL(window.location.href);
    const err = url.searchParams.get("error");
    if (err) {
      bug.extra = `Error message: ${err}`;
    }
  });

  // Feature suggestion state
  let feature: {
    title: string;
    description: string;
    useCase: string;
    priority: "Low" | "Medium" | "High";
    extra: string;
  } = $state({
    title: "",
    description: "",
    useCase: "",
    priority: "Medium",
    extra: "",
  });

  async function sendReport() {
    isSubmitting = true;
    formMessage = "";
    const payload = {
      title: bug.title,
      reported: location.href,
      comment: `Steps:\n${bug.steps}\n\nExpected:\n${bug.expected}\n\nActual:\n${bug.actual}\n\nDevice: ${bug.deviceType}\nOS: ${bug.os}\nBrowser: ${bug.browser}\n\nExtra:\n${bug.extra}`,
      report_type: "website",
      image_url: bug.imageUrl,
    };
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess = true;
        setTimeout(onCancel, 1000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      formMessage = err.message;
    } finally {
      isSubmitting = false;
    }
  }

  async function sendFeature() {
    isSubmitting = true;
    formMessage = "";
    const payload = {
      title: feature.title,
      reported: document.referrer,
      comment: `**Description:**\n${feature.description}\n\n**Use Case:**\n${feature.useCase}\n\n**Priority:** ${feature.priority}\n\n**Extra:**\n${feature.extra}`,
      report_type: "website",
      image_url: "",
    };
    try {
      const res = await fetch("/api/feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess = true;
        setTimeout(onCancel, 1000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      formMessage = err.message;
    } finally {
      isSubmitting = false;
    }
  }
</script>

<SsgoiTransition id={page.url.pathname}>
  <section class="min-h-screen w-full flex flex-col">
    <!-- Tabs -->
    <div class="tabs tabs-border justify-center w-full">
      <button
        class="tab flex-1"
        class:tab-active={currentTab === "bug"}
        onclick={() => (currentTab = "bug")}
      >
        Report a Bug
      </button>
      <button
        class="tab flex-1"
        class:tab-active={currentTab === "feature"}
        onclick={() => (currentTab = "feature")}
      >
        Suggest a Feature
      </button>
    </div>

    <!-- Tab Content -->
    {#if currentTab === "bug"}
      <form
        class="flex-1 overflow-auto p-8 grid gap-6 max-w-2xl w-full mx-auto"
        onsubmit={sendReport}
        autocomplete="off"
      >
        <h2 class="text-3xl font-clash mb-2 text-center">Report a Bug</h2>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">
            Title <span class="text-red-500">*</span>
          </span>
          <input
            bind:value={bug.title}
            required
            class="input input-bordered rounded-xl w-full"
            maxlength="80"
          />
        </label>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex flex-col gap-1">
            <span class="font-semibold">Device Type</span>
            <select
              bind:value={bug.deviceType}
              class="select select-bordered rounded-xl"
            >
              <option>Desktop</option>
              <option>Laptop</option>
              <option>Tablet</option>
              <option>Smartphone</option>
            </select>
          </label>
          <label class="flex flex-col gap-1">
            <span class="font-semibold">Operating System</span>
            <input
              bind:value={bug.os}
              placeholder="e.g. Windows 11, Android 14"
              class="input input-bordered rounded-xl"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="font-semibold">Browser</span>
            <input
              bind:value={bug.browser}
              placeholder="e.g. Chrome 126"
              class="input input-bordered rounded-xl"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="font-semibold">Screenshot / Image URL</span>
            <input
              bind:value={bug.imageUrl}
              type="url"
              placeholder="https://..."
              class="input input-bordered rounded-xl"
            />
          </label>
        </div>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">
            Steps to Reproduce <span class="text-red-500">*</span>
          </span>
          <textarea
            bind:value={bug.steps}
            required
            class="textarea textarea-bordered rounded-xl min-h-[60px] w-full"
            maxlength="400"
            placeholder="1. Go to…&#10;2. Click on…&#10;3. ..."
          ></textarea>
        </label>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex flex-col gap-1">
            <span class="font-semibold">Expected Behavior</span>
            <textarea
              bind:value={bug.expected}
              class="textarea textarea-bordered rounded-xl min-h-[40px]"
              maxlength="200"
              placeholder="What did you expect to happen?"
            ></textarea>
          </label>
          <label class="flex flex-col gap-1">
            <span class="font-semibold">Actual Behavior</span>
            <textarea
              bind:value={bug.actual}
              class="textarea textarea-bordered rounded-xl min-h-[40px]"
              maxlength="200"
              placeholder="What actually happened?"
            ></textarea>
          </label>
        </div>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">Additional context</span>
          <textarea
            bind:value={bug.extra}
            class="textarea textarea-bordered rounded-xl min-h-[40px] w-full"
            maxlength="250"
            placeholder="Anything else? (optional)"
          ></textarea>
        </label>
        <div class="flex justify-end">
          <button
            type="submit"
            class="btn btn-primary"
            disabled={isSubmitting || !isConnected}
          >
            {#if isSubmitting}
              <span class="loading loading-spinner"></span> Reporting...
            {:else if showSuccess}
              <i class="fa-solid fa-check"></i> Reported!
            {:else}
              Send Report
            {/if}
          </button>
        </div>
        {#if formMessage}
          <p class="text-error text-center">{formMessage}</p>
        {/if}
        {#if !isConnected}
          <p class="text-error text-center">
            You must be connected to report a bug
          </p>
        {/if}
      </form>
    {:else}
      <form
        class="flex-1 overflow-auto p-8 grid gap-6 max-w-2xl w-full mx-auto"
        onsubmit={sendFeature}
        autocomplete="off"
      >
        <h2 class="text-3xl font-clash mb-2 text-center">Suggest a Feature</h2>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">
            Feature Title <span class="text-red-500">*</span>
          </span>
          <input
            bind:value={feature.title}
            required
            class="input input-bordered rounded-xl w-full"
            maxlength="80"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">
            Description <span class="text-red-500">*</span>
          </span>
          <textarea
            bind:value={feature.description}
            required
            class="textarea textarea-bordered rounded-xl min-h-[60px] w-full"
            maxlength="400"
          ></textarea>
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">Use Case</span>
          <textarea
            bind:value={feature.useCase}
            class="textarea textarea-bordered rounded-xl min-h-[40px] w-full"
            maxlength="200"
          ></textarea>
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">Priority</span>
          <select
            bind:value={feature.priority}
            class="select select-bordered rounded-xl w-full"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">Additional Context</span>
          <textarea
            bind:value={feature.extra}
            class="textarea textarea-bordered rounded-xl min-h-[40px] w-full"
            maxlength="250"
          ></textarea>
        </label>

        <div class="flex justify-end">
          <button
            type="submit"
            class="btn btn-primary"
            disabled={isSubmitting || !isConnected}
          >
            {#if isSubmitting}
              <span class="loading loading-spinner"></span> Sending...
            {:else if showSuccess}
              <i class="fa-solid fa-check"></i> Sent!
            {:else}
              Send Suggestion
            {/if}
          </button>
        </div>
        {#if formMessage}
          <p class="text-error text-center">{formMessage}</p>
        {/if}
        {#if !isConnected}
          <p class="text-error text-center">
            You must be connected to suggest a feature
          </p>
        {/if}
      </form>
    {/if}
  </section>
</SsgoiTransition>
