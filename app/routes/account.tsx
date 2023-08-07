import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useLoaderData,
} from "@remix-run/react";

import { updateUser } from "~/models/user.server";
import { requireUser } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  return json({ user });
};

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const openAIKey = formData.get("openAIKey");

  if (typeof openAIKey !== "string" || openAIKey.length === 0) {
    return json(
      { user: null, errors: { openAIKey: "Open AI Key is required" } },
      { status: 400 }
    );
  }

  const updatedUser = await updateUser(user.email, { openAIKey });

  return json(
    { user: updatedUser, errors: { openAIKey: null } },
    { status: 200 }
  );
};

export const meta: V2_MetaFunction = () => [{ title: "Account | TranslAIte" }];

export default function Account() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="mr-auto text-3xl font-bold">
          <Link to="/t">TranslAIte</Link>
        </h1>
        <div className="ml-auto flex items-center">
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </div>
      </header>

      <div className="m-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="openAIKey"
              className="block text-sm font-medium text-gray-700"
            >
              Open AI key
            </label>
            <div className="mt-1">
              <input
                id="openAIKey"
                required
                autoFocus={true}
                name="openAIKey"
                type="text"
                autoComplete="off"
                defaultValue={
                  actionData?.user?.openAIKey ||
                  loaderData.user.openAIKey ||
                  undefined
                }
                aria-invalid={actionData?.errors?.openAIKey ? true : undefined}
                aria-describedby="openAIKey-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.openAIKey ? (
                <div className="pt-1 text-red-700" id="openAIKey-error">
                  {actionData.errors.openAIKey}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </Form>

        {actionData?.user?.openAIKey ? (
          <div className="mt-8 rounded border border-green-400 bg-green-100 px-8 py-4 text-green-700">
            <p className="text-lg font-bold">Account updated!</p>
          </div>
        ) : null}

        <hr className="my-6" />

        <div className="space-y-2 text-center">
          <Link
            to="delete"
            className="rounded border border-red-200 px-8 py-4 text-red-700 hover:bg-red-200 hover:text-red-800"
          >
            Delete account
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
