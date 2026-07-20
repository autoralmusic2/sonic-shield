import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/minutas")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  beforeLoad: () => {
    throw redirect({ to: "/contratos" });
  },
  component: () => null,
});
