<script lang="ts">
  import { m } from "$lib/paraglide/messages";

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
      bug.extra = m.report_bug_error_prefix_text({ message: err });
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
            <h1 class="text-3xl font-clash">
              {m.report_feedback_title_h1()}
            </h1>
            <p class="text-base-content/70 mt-2">
              {m.report_page_intro_text()}
            </p>
          </header>
          <!-- Tabs -->
          <div
            class="tabs tabs-boxed w-full"
            role="tablist"
            aria-label={m.report_tabs_select_label_aria()}
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
              {m.report_tabs_bug_label()}
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
              {m.report_tabs_feature_label()}
            </button>
          </div>

          {#if !isConnected}
            <div class="alert alert-warning mt-2">
              <span>{m.report_auth_required_text()}</span>
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
              <h2 class="text-3xl font-clash mb-2 text-center">
                {m.report_bug_title_h2()}
              </h2>
              <fieldset class="contents" disabled={isSubmitting}>
                <label class="flex flex-col gap-1">
                  <span class="font-semibold">
                    {m.report_bug_title_label()}{" "}
                    {m.report_bug_title_label()}
                    <span class="text-red-500">*</span>
                  </span>
                  <input
                    bind:value={bug.title}
                    required
                    class="input input-bordered rounded-xl w-full"
                    maxlength="80"
                  />
                  <span class="text-xs text-base-content/60">
                    {m.report_bug_title_helper_text()}
                  </span>
                </label>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label class="flex flex-col gap-1">
                    <span class="font-semibold">
                      {m.report_bug_device_type_label()}
                    </span>
                    <select
                      bind:value={bug.deviceType}
                      class="select select-bordered rounded-xl"
                    >
                      <option value="Desktop">
                        {m.report_bug_device_desktop_label()}
                      </option>
                      <option value="Laptop">
                        {m.report_bug_device_laptop_label()}
                      </option>
                      <option value="Tablet">
                        {m.report_bug_device_tablet_label()}
                      </option>
                      <option value="Smartphone">
                        {m.report_bug_device_phone_label()}
                      </option>
                    </select>
                  </label>
                  <label class="flex flex-col gap-1">
                    <span class="font-semibold">
                      {m.report_bug_os_label()}
                    </span>
                    <input
                      bind:value={bug.os}
                      placeholder={m.report_bug_os_placeholder()}
                      class="input input-bordered rounded-xl"
                    />
                  </label>
                  <label class="flex flex-col gap-1">
                    <span class="font-semibold">
                      {m.report_bug_browser_label()}
                    </span>
                    <input
                      bind:value={bug.browser}
                      placeholder={m.report_bug_browser_placeholder()}
                      class="input input-bordered rounded-xl"
                    />
                  </label>
                  <label class="flex flex-col gap-1">
                    <span class="font-semibold">
                      {m.report_bug_image_label()}
                    </span>
                    <input
                      bind:value={bug.imageUrl}
                      type="url"
                      placeholder={m.report_bug_screenshot_placeholder()}
                      class="input input-bordered rounded-xl"
                      inputmode="url"
                      pattern="https?://.+"
                    />
                    {#if bug.imageUrl && /^https?:\/\//.test(bug.imageUrl)}
                      <figure class="mt-2">
                        <img
                          src={bug.imageUrl}
                          alt={m.report_bug_screenshot_alt()}
                          class="rounded-box border max-h-48 object-contain"
                          referrerpolicy="no-referrer"
                        />
                      </figure>
                    {/if}
                  </label>
                </div>

                <label class="flex flex-col gap-1">
                  <span class="font-semibold">
                    {m.report_bug_steps_label()}
                    <span class="text-red-500">*</span>
                  </span>
                  <textarea
                    bind:value={bug.steps}
                    required
                    class="textarea textarea-bordered rounded-xl min-h-[60px] w-full"
                    maxlength="400"
                    placeholder={m.report_bug_steps_placeholder()}
                  ></textarea>
                </label>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label class="flex flex-col gap-1">
                    <span class="font-semibold">
                      {m.report_bug_expected_label()}
                    </span>
                    <textarea
                      bind:value={bug.expected}
                      class="textarea textarea-bordered rounded-xl min-h-[40px]"
                      maxlength="200"
                      placeholder={m.report_bug_expected_placeholder()}
                    ></textarea>
                  </label>
                  <label class="flex flex-col gap-1">
                    <span class="font-semibold">
                      {m.report_bug_actual_label()}
                    </span>
                    <textarea
                      bind:value={bug.actual}
                      class="textarea textarea-bordered rounded-xl min-h-[40px]"
                      maxlength="200"
                      placeholder={m.report_bug_actual_placeholder()}
                    ></textarea>
                  </label>
                </div>

                <label class="flex flex-col gap-1">
                  <span class="font-semibold">
                    {m.report_bug_extra_label()}
                  </span>
                  <textarea
                    bind:value={bug.extra}
                    class="textarea textarea-bordered rounded-xl min-h-[40px] w-full"
                    maxlength="250"
                    placeholder={m.report_bug_additional_context_placeholder()}
                  ></textarea>
                </label>
                <div class="flex justify-end gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    title={!isConnected ? m.report_submit_signin_title() : undefined}
                    disabled={isSubmitting || !isConnected}
                  >
                    {#if isSubmitting}
                      <span class="loading loading-spinner"></span>
                    {:else if showSuccess}
                      <i class="fa-solid fa-check"></i>
                    {/if}
                    {m.report_bug_submit_label({
                      state: isSubmitting
                        ? "loading"
                        : showSuccess
                          ? "success"
                          : "idle",
                    })}
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
                {m.report_feature_title_h2()}
              </h2>
              <fieldset class="contents" disabled={isSubmitting}>
                <label class="flex flex-col gap-1">
                  <span class="font-semibold">
                    {m.report_feature_title_label()}
                    <span class="text-red-500">*</span>
                  </span>
                  <input
                    bind:value={feature.title}
                    required
                    class="input input-bordered rounded-xl w-full"
                    maxlength="80"
                  />
                  <span class="text-xs text-base-content/60">
                    {m.report_feature_title_helper_text()}
                  </span>
                </label>

                <label class="flex flex-col gap-1">
                  <span class="font-semibold">
                    {m.report_feature_description_label()}
                    <span class="text-red-500">*</span>
                  </span>
                  <textarea
                    bind:value={feature.description}
                    required
                    class="textarea textarea-bordered rounded-xl min-h-[60px] w-full"
                    maxlength="400"
                  ></textarea>
                  <span class="text-xs text-base-content/60">
                    {m.report_feature_description_helper_text()}
                  </span>
                </label>

                <label class="flex flex-col gap-1">
                  <span class="font-semibold">
                    {m.report_feature_use_case_label()}
                  </span>
                  <textarea
                    bind:value={feature.useCase}
                    class="textarea textarea-bordered rounded-xl min-h-[40px] w-full"
                    maxlength="200"
                  ></textarea>
                  <span class="text-xs text-base-content/60">
                    {m.report_feature_use_case_helper_text()}
                  </span>
                </label>

                <label class="flex flex-col gap-1">
                  <span class="font-semibold">
                    {m.report_feature_priority_label()}
                  </span>
                  <select
                    bind:value={feature.priority}
                    class="select select-bordered rounded-xl w-full"
                  >
                    <option value="Low">
                      {m.report_feature_priority_low_label()}
                    </option>
                    <option value="Medium">
                      {m.report_feature_priority_medium_label()}
                    </option>
                    <option value="High">
                      {m.report_feature_priority_high_label()}
                    </option>
                  </select>
                </label>

                <label class="flex flex-col gap-1">
                  <span class="font-semibold">
                    {m.report_feature_extra_label()}
                  </span>
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
                    title={!isConnected ? m.report_submit_signin_title() : undefined}
                    disabled={isSubmitting || !isConnected}
                  >
                    {#if isSubmitting}
                      <span class="loading loading-spinner"></span>
                    {:else if showSuccess}
                      <i class="fa-solid fa-check"></i>
                    {/if}
                    {m.report_feature_submit_label({
                      state: isSubmitting
                        ? "loading"
                        : showSuccess
                          ? "success"
                          : "idle",
                    })}
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
