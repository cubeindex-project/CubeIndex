import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals: { user } }) => {
  if (!user) throw redirect(302, "/auth/login");

  return {
    meta: { title: "Userbar - CubeIndex", noindex: true },
  };
};
