import { createRoutesStub } from "react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Home from "./home";

describe("Home", () => {
  test("Agile Studio Logoが表示されること", async () => {
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: Home,
      },
    ]);

    render(<Stub initialEntries={["/"]} />);

    expect(await screen.findByAltText("Agile Studio Logo")).toBeInTheDocument();
  });
});
