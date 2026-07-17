import { slugify } from "$lib/components/helper_functions/slugify.svelte";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner";
import { vendorFormSchema } from "$lib/schemas/vendorForm";
import type { TablesInsert } from "$lib/types/database.types";
import { error } from "@sveltejs/kit";
import {
  message,
  setError,
  superValidate,
  withFiles,
} from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { isFile } from "$lib/utils/isFile";
import { cleanUpVendorLogo } from "$lib/server/vendor/cleanUpVendorLogo";
import { uploadVendorLogo } from "$lib/server/vendor/uploadVendorLogo";
import { StatusError } from "$lib/errors/StatusError";

export const load = (async () => {
  return {
    form: await superValidate(zod4(vendorFormSchema), { errors: false }),
    meta: {
      title: "Submit a Vendor - CubeIndex",
      noindex: true,
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals: { supabase, user, log } }) => {
    if (!user) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(vendorFormSchema));
    if (!form.valid) {
      return withFiles(
        message(form, "Please fix the highlighted fields and try again.", {
          status: 400,
        }),
      );
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
          error instanceof StatusError
            ? error
            : new StatusError(500, "Unable to upload the logo.");

        return withFiles(
          setError(form, "logo", uploadError.message, {
            status: uploadError.status,
          }),
        );
      }
    }

    const payload: TablesInsert<"vendors"> = {
      name: form.data.name,
      slug,
      base_url: cleanLink(form.data.baseURL),
      country_iso: form.data.countryISO,
      currency: form.data.currency,
      logo_url: logoURL,
      submitted_by_id: user.id,
      status: "Pending",
      sponsored: false,
      supports_price_scraping: false,
      supports_product_scraping: false,
    };

    const { error: insertError } = await supabase
      .from("vendors")
      .insert(payload);

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

    return withFiles(
      message(
        form,
        'Vendor submitted for review! Track its status on <a class="link" href="/user/submissions">your submissions page</a>.',
      ),
    );
  },
};
