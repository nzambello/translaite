import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import { getTranslationsListItems } from "~/models/translation.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const translations = await getTranslationsListItems({ userId });
  return json({ translations });
};

export default function TranslationsPage() {
  const data = useLoaderData<typeof loader>();
  const [expanded, _setExpanded] = useState(false);
  const setExpanded: typeof _setExpanded = (value) => {
    const isMobile = window.matchMedia("(max-width: 640px)").matches;

    if (isMobile) {
      _setExpanded(value);
    } else {
      _setExpanded(true);
    }
  };

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 640px)").matches;

    if (!isMobile) {
      _setExpanded(true);
    }
  }, []);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="mr-auto text-3xl font-bold max-[375px]:hidden">
          <Link to=".">TranslAIte</Link>
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
        <aside
          className="fixed left-0 z-10 h-full max-w-0 border-r bg-gray-50  sm:static sm:w-80"
          style={{
            maxWidth: expanded ? "100%" : "3rem",
          }}
        >
          <Link
            to="new"
            className="m-2 block rounded bg-blue-500 px-8 py-4 text-xl text-white hover:bg-blue-600 active:bg-blue-700"
            style={{
              padding: expanded ? "0.75rem 1.5rem" : "0.5rem",
            }}
            onClick={() => setExpanded(false)}
          >
            {expanded ? "+ New Translation" : "+"}
          </Link>

          <hr />

          <ul className={expanded ? "block" : "hidden"}>
            {data.translations.length === 0 ? (
              <li>
                <p className="p-4">No translations yet</p>
              </li>
            ) : (
              data.translations.map((t) => (
                <li key={t.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={t.id}
                    onClick={() => setExpanded(false)}
                  >
                    [{t.lang}] {t.text}
                  </NavLink>
                </li>
              ))
            )}
          </ul>

          <div className="">
            <button
              className="block p-4 text-xl text-blue-500 "
              onClick={() => {
                _setExpanded(!expanded);
              }}
            >
              {expanded ? "<<" : ">>"}
            </button>
          </div>
        </aside>

        <div
          className="max-w-full flex-1 p-6"
          style={{
            paddingLeft: expanded ? "1.5rem" : "4.5rem",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
