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

    console.log("Submission type:", typeof submission, submission);
    console.log("Is File:", submission instanceof File);

    if (!(submission instanceof File)) {
      throw error(400, "Submission is not a file");
    }

    const { error: err } = await supabase.storage
      .from("submissions")
      .upload(
        `CubeIndex Championship 2025/${username}/submission.mp4`,
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
