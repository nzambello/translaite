import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { getTranslationsListItems } from "~/models/translation.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const translations = await getTranslationsListItems({ userId });
  return json({ translations });
};

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="mr-auto text-3xl font-bold">
          <Link to=".">Translations</Link>
        </h1>
        <div className="ml-auto flex items-center">
          <Link
            to="/account"
            className="mr-2 rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Account
          </Link>
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

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Translation
          </Link>

          <hr />

          {data.translations.length === 0 ? (
            <p className="p-4">No translations yet</p>
          ) : (
            <ol>
              {data.translations.map((t) => (
                <li key={t.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={t.id}
                  >
                    [{t.lang}] {t.text}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
