import type { TablesInsert } from "$lib/types/database.types";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  locals: { user, supabase },
  request,
}) => {
  if (!user)
    return json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 },
    );

  const { title, reported, report_type, comment, image_url } =
    await request.json();

  if (!report_type || !reported)
    return json(
      {
        success: false,
        error: "An error occurred",
      },
      { status: 500 },
    );

  if (!title || !comment)
    return json(
      {
        success: false,
        error: "Please make sure you filled all the required fields",
      },
      { status: 500 },
    );

  const payload: TablesInsert<"reports"> = {
    title,
    reporter: user.id,
    reported,
    report_type,
    comment,
    image_url,
  };

  const { error: err } = await supabase.from("reports").insert([payload]);

  if (err)
    return json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 },
    );

  return json({ success: true });
};
