<script lang="ts">
  import { resolve } from "$app/paths";
  import type { VendorFormSchema } from "$lib/schemas/vendorForm";
  import {
    superForm,
    type Infer,
    type SuperValidated,
  } from "sveltekit-superforms";
  import { onDestroy, untrack } from "svelte";
  import FormField from "./FormField.svelte";
  import SubmissionFormFooter from "./SubmissionFormFooter.svelte";
  import SubmissionFormHeader from "./SubmissionFormHeader.svelte";

  interface Props {
    initialForm: SuperValidated<Infer<VendorFormSchema>>;
  }

  let { initialForm }: Props = $props();

  const { form, allErrors, constraints, errors, message, enhance } = superForm(
    untrack(() => initialForm),
    {
      resetForm: false,
      onError({ result }) {
        $message = result.error.message || "Unknown error";
      },
    },
  );

  const vendorSubmissionManualPath = "/docs/submission-manual/vendors";

  function getHelpHref(section: string) {
    return vendorSubmissionManualPath + "#" + section;
  }

  let logoPreviewURL: string | null = $state($form.logo ?? null);
  let logoError: string | null = $state(null);
  const logoFormErrors = $derived(
    Array.isArray($errors.logo) ? $errors.logo : undefined,
  );

  function clearLogoPreview() {
    if (logoPreviewURL) URL.revokeObjectURL(logoPreviewURL);
    logoPreviewURL = null;
  }

  function handleLogoChange(event: Event) {
    clearLogoPreview();
    logoError = null;

    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ]);
    if (!allowedTypes.has(file.type)) {
      logoError = "Use a JPEG, PNG, WebP, or AVIF image.";
      input.value = "";
      return;
    }
    if (file.size > 512 * 1024) {
      logoError = "Logo files must be 512 KB or smaller.";
      input.value = "";
      return;
    }

    logoPreviewURL = URL.createObjectURL(file);
  }

  onDestroy(clearLogoPreview);
</script>

<section class="relative min-h-screen py-16">
  <div class="relative mx-auto flex w-full max-w-4xl flex-col gap-12 px-6">
    <SubmissionFormHeader
      title="Submit a Vendor"
      description="Provide the store's official details so the CubeIndex team can verify and publish it."
    />

    <div class="flex justify-end">
      <a
        href={resolve(vendorSubmissionManualPath)}
        class="btn btn-ghost btn-sm"
      >
        <i class="fa-solid fa-book-open" aria-hidden="true"></i>
        Submission manual
      </a>
    </div>

    <form method="POST" enctype="multipart/form-data" use:enhance>
      <div class="space-y-10">
        <section class="space-y-6" aria-labelledby="vendor-details-heading">
          <div class="space-y-1 border-b border-base-300 pb-3">
            <h2 class="flex items-center gap-2 text-xl font-semibold">
              Vendor details
            </h2>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <FormField
              title="Vendor name"
              error={$errors.name}
              required
              helpHref={getHelpHref("vendor-name")}
            >
              <input
                name="name"
                type="text"
                class="input w-full"
                placeholder="Example Store"
                autocomplete="organization"
                bind:value={$form.name}
                {...$constraints.name}
              />
            </FormField>

            <FormField
              title="Homepage URL"
              error={$errors.baseURL}
              required
              helpHref={getHelpHref("homepage-url")}
            >
              <input
                name="baseURL"
                type="url"
                class="input w-full"
                placeholder="https://example.com"
                autocomplete="url"
                bind:value={$form.baseURL}
                {...$constraints.baseURL}
              />
            </FormField>

            <FormField
              title="Country code"
              error={$errors.countryISO}
              required
              helpHref={getHelpHref("country-code")}
            >
              <input
                name="countryISO"
                type="text"
                class="input w-full uppercase"
                maxlength="2"
                placeholder="US"
                autocomplete="country"
                bind:value={$form.countryISO}
                {...$constraints.countryISO}
              />
            </FormField>

            <FormField
              title="Currency"
              error={$errors.currency}
              required
              helpHref={getHelpHref("currency")}
            >
              <input
                name="currency"
                class="input w-full uppercase"
                placeholder="USD"
                bind:value={$form.currency}
                {...$constraints.currency}
              />
            </FormField>
          </div>
        </section>

        <section class="space-y-6" aria-labelledby="vendor-branding-heading">
          <div class="space-y-1 border-b border-base-300 pb-3">
            <h2
              id="vendor-branding-heading"
              class="flex items-center gap-2 text-xl font-semibold"
            >
              Branding
            </h2>
          </div>

          <FormField
            title="Vendor logo"
            error={logoError ? [logoError] : logoFormErrors}
            helpHref={getHelpHref("vendor-logo")}
          >
            <div class="flex flex-col gap-4 pt-4 sm:flex-row">
              <div
                class="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-box border border-base-300 bg-base-100"
              >
                {#if logoPreviewURL}
                  <img
                    src={logoPreviewURL}
                    alt="Selected vendor logo preview"
                    class="size-full object-contain p-2"
                  />
                {:else}
                  <i
                    class="fa-solid fa-store text-3xl text-base-content/20"
                    aria-hidden="true"
                  ></i>
                  <span class="sr-only">No logo selected</span>
                {/if}
              </div>

              <div class="min-w-0 flex-1 space-y-2">
                <input
                  name="logo"
                  type="file"
                  class="file-input w-full"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onchange={handleLogoChange}
                />
                <p class="text-xs text-base-content/60">
                  Optional. JPEG, PNG, WebP, or AVIF; maximum 512 KB.
                </p>
              </div>
            </div>
          </FormField>
        </section>

        <SubmissionFormFooter
          submitLabel="Submit vendor"
          submissionNote="It may take up to 48h for your submission to be reviewed."
          message={$message}
          allErrors={$allErrors}
        />
      </div>
    </form>
  </div>
</section>
