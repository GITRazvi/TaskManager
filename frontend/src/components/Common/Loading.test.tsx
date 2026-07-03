import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loading } from "./Loading";

describe("Loading", () => {
  it("renders the status label", () => {
    render(<Loading label="Loading tasks" />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading tasks");
  });
});
