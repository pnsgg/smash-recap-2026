import { data } from "react-router";
import { NotFound } from "../pages/NotFound";
import type { Route } from "./+types/not-found";

export function loader() {
  return data(null, { status: 404 });
}

export const meta: Route.MetaFunction = () => [
  { title: "404%: past the blast zone · SmashRecap" },
  { name: "robots", content: "noindex" },
];

export default function NotFoundRoute() {
  return <NotFound />;
}
