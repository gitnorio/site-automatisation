import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AboutMenu } from "@/components/layout/AboutMenu";

describe("AboutMenu", () => {
  it("opens and closes with the keyboard", async () => {
    const user = userEvent.setup();
    render(<AboutMenu />);
    const trigger = screen.getByRole("button", { name: /à propos/i });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Notre méthodologie" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
