import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
  const {
    title,
    reported,
    report_type,
    comment,
    image_url,
  }: {
    title: string;
    reported: string;
    comment: string;
    report_type: string;
    image_url: string;
  } = await request.json();

  if (!report_type || !comment)
    return json(
      {
        success: false,
        error: "An error occured",
      },
      { status: 500 }
    );

  if (!title || !reported)
    return json(
      {
        success: false,
        error: "Please make sure you filled all the required fields",
      },
      { status: 500 }
    );

  const { error: err } = await locals.supabase.from("reports").insert([
    {
      title,
      reporter: locals.user?.id,
      reported,
      report_type,
      comment,
      image_url,
    },
  ]);

  if (err)
    return json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );

  return json({ success: true });
};
