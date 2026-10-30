import { createRequestHandler, type ServerBuild } from "react-router";

const handleRequest = createRequestHandler(
  () => import("virtual:react-router/server-build") as Promise<ServerBuild>,
  process.env.NODE_ENV,
);

export function fetch(request: Request): Promise<Response> {
  return handleRequest(request);
}
