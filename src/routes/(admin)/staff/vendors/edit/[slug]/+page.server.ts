import type { PageServerLoad } from "./$types";
import { vendorFormSchema } from "$lib/schemas/vendorForm";
import { zod4 } from "sveltekit-superforms/adapters";
import { error, fail } from "@sveltejs/kit";
import type { TablesUpdate } from "$lib/types/database-generated.types";
import type { Actions } from "./$types";
import {
  superValidate,
  message,
  setError,
  withFiles,
} from "sveltekit-superforms";
import { slugify } from "$lib/components/helper_functions/slugify.svelte";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner";
import { isFile } from "$lib/utils/isFile";
import { cleanUpVendorLogo } from "$lib/server/vendor/cleanUpVendorLogo";
import {
  uploadVendorLogo,
  VendorLogoUploadError,
} from "$lib/server/vendor/uploadVendorLogo";

export const load = (async ({ params, locals: { supabase, log } }) => {
  const slug = params.slug;

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("name, base_url, country_iso, currency, logo_url")
    .eq("slug", slug)
    .neq("status", "Rejected")
    .maybeSingle();

  if (vendorError) {
    log.error({ err: vendorError }, "Failed to load vendor");
    return error(500, "Failed to load vendor");
  }

  if (!vendor) {
    return error(404, "Vendor not found");
  }

  const form = await superValidate(
    {
      name: vendor.name,
      baseURL: vendor.base_url,
      countryISO: vendor.country_iso,
      currency: vendor.currency,
      logo: vendor.logo_url,
    },
    zod4(vendorFormSchema),
    {
      errors: false,
    },
  );

  return {
    form,
    meta: {
      title: "Edit a Vendor - CubeIndex",
      noindex: true,
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ params, request, locals: { supabase, user, log } }) => {
    if (!user) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(vendorFormSchema));
    if (!form.valid) {
      return withFiles(
        message(form, "Please fix the highlighted fields and try again.", {
          status: 400,
        }),
      );
    }

    const currentVendorSlug = params.slug;
    if (!currentVendorSlug) {
      return fail(400, { form, message: "Missing vendor slug" });
    }

    const { data: previousVendor, error: previousVendorError } = await supabase
      .from("vendors")
      .select("logo_url")
      .eq("slug", currentVendorSlug)
      .maybeSingle();

    if (previousVendorError) {
      log.error({ err: previousVendorError }, "Failed to load existing vendor");
      return fail(500, { form, message: "Unable to load the vendor." });
    }

    if (!previousVendor) {
      return fail(404, { form, message: "Vendor not found." });
    }

    const slug = slugify(form.data.name);
    if (!slug) {
      return withFiles(
        setError(form, "name", "Name must contain letters or numbers.", {
          status: 400,
        }),
      );
    }
    const logo =
      isFile(form.data.logo) && form.data.logo.size ? form.data.logo : null;
    let logoPath: string | null = null;
    let logoURL: string | null = null;

    if (logo) {
      try {
        ({ logoPath, logoURL } = await uploadVendorLogo(
          logo,
          user.id,
          supabase,
          log,
        ));
      } catch (error) {
        const uploadError =
          error instanceof VendorLogoUploadError
            ? error
            : new VendorLogoUploadError(500, "Unable to upload the logo.");

        return withFiles(
          setError(form, "logo", uploadError.message, {
            status: uploadError.status,
          }),
        );
      }
    }

    const payload: TablesUpdate<"vendors"> = {
      name: form.data.name,
      slug,
      base_url: cleanLink(form.data.baseURL),
      country_iso: form.data.countryISO,
      currency: form.data.currency,
      logo_url: logoURL ?? previousVendor.logo_url,
      submitted_by_id: user.id,
    };

    const { error: insertError } = await supabase
      .from("vendors")
      .update(payload)
      .eq("slug", currentVendorSlug);

    if (insertError) {
      if (logoPath) {
        cleanUpVendorLogo(logoPath, supabase, log);
      }

      if (insertError.code === "23505") {
        return withFiles(
          setError(
            form,
            "This vendor name or homepage is already in the database.",
            { status: 400 },
          ),
        );
      }

      log.error({ err: insertError.message }, "Failed to submit vendor");
      return withFiles(
        setError(form, "Unable to submit the vendor.", { status: 500 }),
      );
    }

    if (logoPath && previousVendor.logo_url) {
      const oldLogoPath = new URL(previousVendor.logo_url).pathname.split(
        "/vendors-images/",
      )[1];

      if (oldLogoPath) {
        await cleanUpVendorLogo(decodeURIComponent(oldLogoPath), supabase, log);
      }
    }

    return withFiles(
      message(
        form,
        'Vendor submitted for review! Track its status on <a class="link" href="/user/submissions">your submissions page</a>.',
      ),
    );
  },
};
