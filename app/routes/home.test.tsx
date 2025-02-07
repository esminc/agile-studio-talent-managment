import { createRoutesStub } from "react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Home from "./home";

describe("Home", () => {
  test("React Router DocsとDiscordへのリンクが表示されること", async () => {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: Home,
      },
    ]);

    render(<Stub initialEntries={["/"]} />);

    expect(
      await screen.findByRole("link", { name: "React Router Docs" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "Join Discord" }),
    ).toBeInTheDocument();
  });
});
