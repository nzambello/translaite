import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useRef, useEffect } from "react";

import {
  deleteUserByEmail,
  updateUser,
  verifyLogin,
} from "~/models/user.server";
import { logout, requireUser } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const password = formData.get("password");

  if (request.method !== "DELETE") {
    return json({ errors: { password: null } }, { status: 422 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const checkedUser = await verifyLogin(user.email, password);

  if (!checkedUser) {
    return json(
      { errors: { password: "Password is not correct" } },
      { status: 400 }
    );
  }

  await deleteUserByEmail(user.email);
  return logout(request);
};

export const meta: V2_MetaFunction = () => [{ title: "Account | TranslAIte" }];

export default function Account() {
  const actionData = useActionData<typeof action>();

  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <dialog
      open
      aria-modal="true"
      onClose={() => {
        window.history.back();
      }}
      className="position-fixed left-1/2 top-1/2 m-auto w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform space-y-6 rounded-lg bg-white px-8 py-8 shadow-lg"
    >
      <Form method="DELETE" className="space-y-6">
        <p>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
        <p>Type your password to confirm </p>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              ref={passwordRef}
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {actionData?.errors?.password ? (
              <div className="pt-1 text-red-700" id="password-error">
                {actionData.errors.password}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="reset"
            formMethod="dialog"
            onClick={() => {
              window.history.back();
            }}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full rounded border border-red-200 px-8 py-4 text-red-700 hover:bg-red-200 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </Form>
    </dialog>
  );
}
