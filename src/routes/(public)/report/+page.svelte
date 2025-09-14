<script lang="ts">
  import { page } from "$app/state";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { getContext, hasContext } from "svelte";

  const { data } = $props();
  const { user } = data;

  // then simply coerce to boolean
  const isConnected: boolean = user !== null;

  // which tab: 'bug' or 'feature'
  let currentTab: "bug" | "feature" = $state("bug");

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
      reported: location.href,
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
    <div class="mx-auto w-full max-w-3xl px-4 py-8">
      <div>
        {#if isSubmitting}
          <progress
            class="progress progress-primary w-full rounded-t-box"
            max="100"
          ></progress>
        {/if}
        <div class="card-body gap-6">
          <header class="text-center">
            <h1 class="text-3xl font-clash">Feedback & Reports</h1>
            <p class="text-base-content/70 mt-2">
              Help us improve CubeIndex by reporting bugs or suggesting
              features.
            </p>
          </header>
          <!-- Tabs -->
          <div
            class="tabs tabs-boxed w-full"
            role="tablist"
            aria-label="Select report type"
          >
            <button
              class="tab grow"
              class:tab-active={currentTab === "bug"}
              role="tab"
              aria-selected={currentTab === "bug"}
              aria-controls="panel-bug"
              tabindex={currentTab === "bug" ? 0 : -1}
              onclick={() => (currentTab = "bug")}
            >
              Report a Bug
            </button>
            <button
              class="tab grow"
              class:tab-active={currentTab === "feature"}
              role="tab"
              aria-selected={currentTab === "feature"}
              aria-controls="panel-feature"
              tabindex={currentTab === "feature" ? 0 : -1}
              onclick={() => (currentTab = "feature")}
            >
              Suggest a Feature
            </button>
          </div>

          {#if !isConnected}
            <div class="alert alert-warning mt-2">
              <span
                >You must be signed in to submit. Please log in to continue.</span
              >
            </div>
          {/if}

          <!-- Tab Content -->
          {#if currentTab === "bug"}
            <form
              id="panel-bug"
              class="grid gap-6"
              onsubmit={sendReport}
              aria-busy={isSubmitting}
              autocomplete="off"
            >
              <h2 class="text-3xl font-clash mb-2 text-center">Report a Bug</h2>
              <fieldset class="contents" disabled={isSubmitting}>
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
                  <span class="text-xs text-base-content/60"
                    >Max 80 characters</span
                  >
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
                      inputmode="url"
                      pattern="https?://.+"
                    />
                    {#if bug.imageUrl && /^https?:\/\//.test(bug.imageUrl)}
                      <figure class="mt-2">
                        <img
                          src={bug.imageUrl}
                          alt="Attached screenshot"
                          class="rounded-box border max-h-48 object-contain"
                          referrerpolicy="no-referrer"
                        />
                      </figure>
                    {/if}
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
                <div class="flex justify-end gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    title={!isConnected ? "Sign in to submit" : undefined}
                    disabled={isSubmitting || !isConnected}
                  >
                    {#if isSubmitting}
                      <span class="loading loading-spinner"></span> Reporting…
                    {:else if showSuccess}
                      <i class="fa-solid fa-check"></i> Reported!
                    {:else}
                      Send Report
                    {/if}
                  </button>
                </div>
              </fieldset>
              {#if formMessage}
                <div class="alert alert-error" role="alert" aria-live="polite">
                  <span>{formMessage}</span>
                </div>
              {/if}
            </form>
          {:else}
            <form
              id="panel-feature"
              class="grid gap-6"
              onsubmit={sendFeature}
              aria-busy={isSubmitting}
              autocomplete="off"
            >
              <h2 class="text-3xl font-clash mb-2 text-center">
                Suggest a Feature
              </h2>
              <fieldset class="contents" disabled={isSubmitting}>
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
                  <span class="text-xs text-base-content/60"
                    >Be specific and concise</span
                  >
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
                  <span class="text-xs text-base-content/60"
                    >Explain what the feature does</span
                  >
                </label>

                <label class="flex flex-col gap-1">
                  <span class="font-semibold">Use Case</span>
                  <textarea
                    bind:value={feature.useCase}
                    class="textarea textarea-bordered rounded-xl min-h-[40px] w-full"
                    maxlength="200"
                  ></textarea>
                  <span class="text-xs text-base-content/60"
                    >How would you use it?</span
                  >
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

                <div class="flex justify-end gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    title={!isConnected ? "Sign in to submit" : undefined}
                    disabled={isSubmitting || !isConnected}
                  >
                    {#if isSubmitting}
                      <span class="loading loading-spinner"></span> Sending…
                    {:else if showSuccess}
                      <i class="fa-solid fa-check"></i> Sent!
                    {:else}
                      Send Suggestion
                    {/if}
                  </button>
                </div>
              </fieldset>
              {#if formMessage}
                <div class="alert alert-error" role="alert" aria-live="polite">
                  <span>{formMessage}</span>
                </div>
              {/if}
            </form>
          {/if}
        </div>
      </div>
    </div>
  </section>
</SsgoiTransition>
