import type { TablesInsert } from "#lib/types/database.types.ts";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals: { user, supabase, log },
  request,
}) => {
  if (!user)
    return Response.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 },
    );

  const { title, reported, report_type, comment, image_url } =
    await request.json();

  if (!report_type || !reported)
    return Response.json(
      {
        success: false,
        error: "An error occurred",
      },
      { status: 500 },
    );

  if (!title || !comment)
    return Response.json(
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

  if (err) {
    log.error(
      { err, reportType: report_type, reporterUserID: user.id },
      "Failed to create report",
    );
    return Response.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 },
    );
  }

  log.info(
    { event: "report.created", reportType: report_type, reportedID: reported },
    "Report created",
  );
  return Response.json({ success: true });
};
