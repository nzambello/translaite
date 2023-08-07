import { Link } from "@remix-run/react";

export default function TranslationsIndexPage() {
  return (
    <p>
      No translation selected. Select one the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        start a new translation
      </Link>
      .
    </p>
  );
}
