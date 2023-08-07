import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createTranslation } from "~/models/translation.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const lang = formData.get("lang");
  const text = formData.get("text");

  if (typeof lang !== "string" || lang.length === 0) {
    return json(
      { errors: { text: null, lang: "Lang is required" } },
      { status: 400 }
    );
  }

  if (typeof text !== "string" || text.length === 0) {
    return json(
      { errors: { text: "Text is required", lang: null } },
      { status: 400 }
    );
  }

  const result = "test";

  const t = await createTranslation({ lang, text, result, userId });

  return redirect(`/t/${t.id}`);
};

export default function NewTranslationPage() {
  const actionData = useActionData<typeof action>();
  const langRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.lang) {
      langRef.current?.focus();
    } else if (actionData?.errors?.text) {
      textRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Translate to: </span>
          <input
            ref={langRef}
            name="lang"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.lang ? true : undefined}
            aria-errormessage={
              actionData?.errors?.lang ? "lang-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.lang ? (
          <div className="pt-1 text-red-700" id="lang-error">
            {actionData.errors.lang}
          </div>
        ) : null}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Text: </span>
          <textarea
            ref={textRef}
            name="text"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            aria-invalid={actionData?.errors?.text ? true : undefined}
            aria-errormessage={
              actionData?.errors?.text ? "text-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.text ? (
          <div className="pt-1 text-red-700" id="text-error">
            {actionData.errors.text}
          </div>
        ) : null}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Translate
        </button>
      </div>
    </Form>
  );
}
