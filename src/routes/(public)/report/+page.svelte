<script lang="ts">
  import { page } from "$app/state";
  import Modal from "$lib/components/ui/Modal.svelte";
  import type {
    BugReportSchema,
    FeatureRequestSchema,
  } from "$lib/schemas/report.js";
  import { onMount } from "svelte";

  const { data } = $props();
  const { user } = $derived(data);

  const isConnected: boolean = $derived(user !== null);

  let currentTab: "bug" | "feature" = $state("bug");

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");
  let consentOpen = $state(false);

  let reportOptions = $state({
    linkToAccount: false,
    githubUsername: "",
  });

  let bugReportForm = $state({
    title: "",
    reproductionSteps: "",
    expected: "",
    actual: "",
    affectedURL: page.url.searchParams.get("affectedURL") ?? "",
    imageURL: "",
    requestID: page.url.searchParams.get("requestID") ?? "",
    userAgent: "",
    deviceType: "Desktop",
    os: "",
    browser: "",
    extra: page.url.searchParams.get("error")
      ? `Error message: "${page.url.searchParams.get("error")}"`
      : "",
  }) satisfies Omit<BugReportSchema, "linkToAccount" | "githubUsername">;

  let featureRequestForm = $state({
    title: "",
    description: "",
    useCase: "",
    priority: "Medium",
    extra: "",
  }) satisfies Omit<FeatureRequestSchema, "linkToAccount" | "githubUsername">;

  function openConsent(e: SubmitEvent) {
    e.preventDefault();
    formMessage = "";
    consentOpen = true;
  }

  async function sendReport() {
    isSubmitting = true;
    formMessage = "";
    try {
      const response = await fetch("/api/report/bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bugReportForm,
          ...reportOptions,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const error =
          body !== null && "error" in body
            ? body.error
            : `${response.status} ${response.statusText}`;
        throw new Error(error);
      }

      showSuccess = true;
    } catch (error) {
      formMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
    } finally {
      isSubmitting = false;
    }
  }

  async function sendFeature() {
    isSubmitting = true;
    formMessage = "";
    try {
      const response = await fetch("/api/report/feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...featureRequestForm,
          ...reportOptions,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const error =
          body !== null && "error" in body
            ? body.error
            : `${response.status} ${response.statusText}`;
        throw new Error(error);
      }

      showSuccess = true;
    } catch (error) {
      formMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
    } finally {
      isSubmitting = false;
    }
  }

  async function submitWithConsent() {
    consentOpen = false;

    if (currentTab === "bug") {
      await sendReport();
    } else {
      await sendFeature();
    }
  }

  onMount(() => {
    bugReportForm.userAgent = navigator.userAgent;
  });
</script>

<section class="min-h-screen w-full flex flex-col">
  <div class="mx-auto w-full max-w-3xl px-4 py-8">
    <div class="card-body gap-6">
      <header class="text-center">
        <h1 class="text-3xl font-clash">Feedback & Reports</h1>
        <p class="text-base-content/70 mt-2">
          Help us improve CubeIndex by reporting bugs or suggesting features.
        </p>
      </header>
      <div
        class="tabs tabs-box w-full"
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
          <span>
            You must be signed in to submit. Please log in to continue.
          </span>
        </div>
      {/if}

      {#if currentTab === "bug"}
        <form
          id="panel-bug"
          class="grid gap-6"
          onsubmit={openConsent}
          aria-busy={isSubmitting}
          autocomplete="off"
        >
          <fieldset class="contents" disabled={isSubmitting}>
            <label class="flex flex-col gap-1">
              <span class="font-semibold">
                Title <span class="text-red-500">*</span>
              </span>
              <input
                bind:value={bugReportForm.title}
                required
                class="input input-bordered rounded-xl w-full"
                maxlength="80"
              />
              <span class="text-xs text-base-content/60">
                Max 80 characters
              </span>
            </label>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex flex-col gap-1">
                <span class="font-semibold">Device Type</span>
                <select
                  bind:value={bugReportForm.deviceType}
                  class="select select-bordered rounded-xl"
                >
                  <option>Desktop</option>
                  <option>Tablet</option>
                  <option>Smartphone</option>
                </select>
              </label>
              <label class="flex flex-col gap-1">
                <span class="font-semibold">Operating System</span>
                <input
                  bind:value={bugReportForm.os}
                  placeholder="e.g. Windows 11, Android 14"
                  class="input input-bordered rounded-xl"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="font-semibold">Browser</span>
                <input
                  bind:value={bugReportForm.browser}
                  placeholder="e.g. Chrome 126"
                  class="input input-bordered rounded-xl"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="font-semibold">Screenshot / Image URL</span>
                <input
                  bind:value={bugReportForm.imageURL}
                  type="url"
                  placeholder="https://..."
                  class="input input-bordered rounded-xl"
                  inputmode="url"
                  pattern="https?://.+"
                />
                {#if bugReportForm.imageURL}
                  <figure class="mt-2">
                    <img
                      src={bugReportForm.imageURL}
                      alt="Attached screenshot"
                      class="rounded-box max-h-48 object-contain"
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
                bind:value={bugReportForm.reproductionSteps}
                required
                class="textarea textarea-bordered rounded-xl min-h-25 w-full"
                maxlength="400"
                placeholder="1. Go to…&#10;2. Click on…&#10;3. ..."></textarea>
            </label>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex flex-col gap-1">
                <span class="font-semibold">Expected Behavior</span>
                <textarea
                  bind:value={bugReportForm.expected}
                  class="textarea textarea-bordered rounded-xl min-h-10"
                  maxlength="200"
                  placeholder="What did you expect to happen?"></textarea>
              </label>
              <label class="flex flex-col gap-1">
                <span class="font-semibold">Actual Behavior</span>
                <textarea
                  bind:value={bugReportForm.actual}
                  class="textarea textarea-bordered rounded-xl min-h-10"
                  maxlength="200"
                  placeholder="What actually happened?"></textarea>
              </label>
            </div>

            <label class="flex flex-col gap-1">
              <span class="font-semibold">Affected page</span>
              <input
                bind:value={bugReportForm.affectedURL}
                type="url"
                class="input input-bordered rounded-xl w-full"
                placeholder="https://thecubeindex.com/..."
              />
            </label>

            <label class="flex flex-col gap-1">
              <span class="font-semibold">Additional context</span>
              <textarea
                bind:value={bugReportForm.extra}
                class="textarea textarea-bordered rounded-xl min-h-10 w-full"
                maxlength="250"
                placeholder="Anything else? (optional)"></textarea>
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
          onsubmit={openConsent}
          aria-busy={isSubmitting}
          autocomplete="off"
        >
          <fieldset class="contents" disabled={isSubmitting}>
            <label class="flex flex-col gap-1">
              <span class="font-semibold">
                Feature Title <span class="text-red-500">*</span>
              </span>
              <input
                bind:value={featureRequestForm.title}
                required
                class="input input-bordered rounded-xl w-full"
                maxlength="80"
              />
              <span class="text-xs text-base-content/60">
                Max 80 characters
              </span>
            </label>

            <label class="flex flex-col gap-1">
              <span class="font-semibold">
                Description <span class="text-red-500">*</span>
              </span>
              <textarea
                bind:value={featureRequestForm.description}
                required
                class="textarea textarea-bordered rounded-xl min-h-15 w-full"
                maxlength="400"></textarea>
            </label>

            <label class="flex flex-col gap-1">
              <span class="font-semibold">Additional Context</span>
              <textarea
                bind:value={featureRequestForm.extra}
                class="textarea textarea-bordered rounded-xl min-h-10 w-full"
                maxlength="250"></textarea>
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
</section>

<Modal
  bind:open={consentOpen}
  title="Review report consent"
  description="Your report will be posted as a public issue in the CubeIndex GitHub repository and may be visible to anyone."
>
  <div class="grid gap-4">
    <div class="alert alert-warning text-sm">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span> Do not include passwords, access tokens, or other secrets. </span>
    </div>

    <label class="flex items-center cursor-pointer justify-start gap-3">
      <input
        bind:checked={reportOptions.linkToAccount}
        type="checkbox"
        class="checkbox mt-0.5"
      />
      <span class="font-semibold">
        Link this report to my CubeIndex account
      </span>
    </label>

    <label class="flex flex-col gap-1">
      <span class="font-semibold"
        >GitHub username <span class="font-normal">(optional)</span></span
      >
      <input
        bind:value={reportOptions.githubUsername}
        class="input input-bordered rounded-xl w-full"
        autocomplete="username"
      />
      <span class="text-xs text-base-content/60">
        If provided, this account will be mentioned in the public issue.
      </span>
    </label>

    <div class="flex justify-end gap-2">
      <button
        type="button"
        class="btn btn-ghost"
        onclick={() => (consentOpen = false)}
      >
        Go back
      </button>
      <button type="button" class="btn btn-primary" onclick={submitWithConsent}>
        Send public report
      </button>
    </div>
  </div>
</Modal>
