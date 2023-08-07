import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createTranslation } from "~/models/translation.server";
import { requireUser } from "~/session.server";

import { Configuration, OpenAIApi } from "openai";

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);

  const formData = await request.formData();
  const lang = formData.get("lang");
  const text = formData.get("text");

  if (typeof lang !== "string" || lang.length === 0) {
    return json(
      { errors: { text: null, lang: "Lang is required", result: null } },
      { status: 400 }
    );
  }

  if (typeof text !== "string" || text.length === 0) {
    return json(
      { errors: { text: "Text is required", lang: null, result: null } },
      { status: 400 }
    );
  }

  if (!user.openAIKey?.length) {
    return redirect("/account");
  }

  try {
    const configuration = new Configuration({
      apiKey: user.openAIKey,
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You will be provided with a sentence, your task is to translate it into ${lang}.`,
        },
        { role: "user", content: text },
      ],
    });
    const result = completion.data.choices[0].message?.content;

    if (typeof result !== "string" || result.length === 0) {
      return json(
        {
          errors: {
            text: null,
            lang: null,
            result: "Error while retrieving translation result",
          },
        },
        { status: 500 }
      );
    }

    const t = await createTranslation({ lang, text, result, userId: user.id });

    return redirect(`/t/${t.id}`);
  } catch (e) {
    let error = e as any;
    if (error.response) {
      console.error(error.response.status);
      console.error(error.response.data);

      return json(
        {
          errors: {
            text: null,
            lang: null,
            result: `[${error.response.status}] ${
              error.response.data || error.message
            }`,
          },
        },
        { status: 500 }
      );
    } else {
      console.error(error.message);
      return json(
        {
          errors: {
            text: null,
            lang: null,
            result: `[${error.name}] ${error.message}`,
          },
        },
        { status: 500 }
      );
    }
  }
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await requireUser(request);

  if (!user.openAIKey?.length) {
    return redirect("/account");
  }

  return json({ userHasOpenAIKey: true });
};

export default function NewTranslationPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
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
            disabled={loaderData?.userHasOpenAIKey === false}
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
            disabled={loaderData?.userHasOpenAIKey === false}
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
          disabled={loaderData?.userHasOpenAIKey === false}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Translate
        </button>
      </div>

      {loaderData?.userHasOpenAIKey === false && (
        <div className="rounded border border-red-200 bg-red-100 p-4 text-red-700">
          <p>
            You need to add your OpenAI API key to your account before you can
            translate text.
          </p>
          <p>
            Go to <Link to="/account">your account</Link> to add your key.
          </p>
        </div>
      )}

      {actionData?.errors?.result && (
        <div className="rounded border border-red-200 bg-red-100 p-4 text-red-700">
          <p>{actionData.errors.result}</p>
        </div>
      )}
    </Form>
  );
}
