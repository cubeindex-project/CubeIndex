import type { PageServerLoad, Actions } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const submission = formData.get("submission");

    if (!(submission instanceof File)) {
      throw error(400, "Submission is not a file");
    }

    // List existing submissions for the user to determine the next submission number
    const { data: existing, error: listError } = await supabase.storage
      .from("submissions")
      .list(`CubeIndex Championship 2025/${username}/`);

    if (listError) throw error(500, listError.message);

    // Count existing submissions to determine the next number
    const count = existing ? existing.length : 0;
    const suffix = ["1st", "2nd", "3rd"];
    const ordinal = count < 3 ? suffix[count] : `${count + 1}th`;
    const filename = `${ordinal} submission${
      submission.name
        ? submission.name.substring(submission.name.lastIndexOf("."))
        : ""
    }`;

    const { error: err } = await supabase.storage
      .from("submissions")
      .upload(
        `CubeIndex Championship 2025/${username}/${filename}`,
        submission,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: submission.type,
        }
      );

    if (err) throw error(500, err.message);
  },
};
