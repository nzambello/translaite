import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteTranslation, getTranslation } from "~/models/translation.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.translationId, "translationId not found");

  const translation = await getTranslation({
    id: params.translationId,
    userId,
  });
  if (!translation) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ translation });
};

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.translationId, "translationId not found");

  await deleteTranslation({ id: params.translationId, userId });

  return redirect("/t");
};

export default function TranslationDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p className="text-xl font-bold">To: {data.translation.lang}</p>
      <p className="py-6">{data.translation.text}</p>
      <hr className="my-4" />
      <p>
        <strong>Result:</strong>
      </p>
      <p className="py-6">{data.translation.result}</p>
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Translation not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
