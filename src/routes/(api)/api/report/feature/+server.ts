import { featureRequestSchema } from "$lib/schemas/report";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import { RequestError } from "@octokit/request-error";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";
import { GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY } from "$env/static/private";

export const POST: RequestHandler = async ({
  request,
  locals: { user, log },
}) => {
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedPayload = featureRequestSchema.safeParse(body);
  if (!parsedPayload.success) {
    return json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const payload = parsedPayload.data;

  const octokit = new Octokit({
    authStrategy: createAppAuth, auth: {
      appId: GITHUB_APP_ID,
    		privateKey: GITHUB_APP_PRIVATE_KEY,
		installationId: GITHUB_APP_INSTALLATION_ID,
  } });

  try {
    await octokit.request("POST /repos/{owner}/{repo}/issues", {
      owner: "cubeindex-project",
      repo: "CubeIndex",
      title: payload.title,
      body: `**Description**\n${payload.description}\n\n**Additional Context**\n${payload.extra}`,
      labels: ["enhancement"],
      headers: {
        "X-GitHub-Api-Version": "2026-03-10",
      },
    });
  } catch (error) {
    if (error instanceof RequestError) {
      log.error(
        {
          err: {
            message: error.message,
            status: error.status,
            requestID: error.request?.headers["x-github-request-id"],
            response: error.response?.data,
          },
        },
        "An error ocurred while creating GitHub issue",
      );

      return json(
        { error: "An error ocurred while creating GitHub issue" },
        {
          status:
            error.status >= 400 && error.status < 600 ? error.status : 502,
        },
      );
    }

    throw error;
  }

  return new Response(null, { status: 204 });
};
