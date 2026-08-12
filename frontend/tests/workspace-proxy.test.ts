import { describe, expect, it } from "vitest";

import { isWorkspaceAuthorized } from "@/proxy";


describe("workspace proxy authorization", () => {
  it("accepts the configured basic credentials", () => {
    const authorization = `Basic ${btoa("agence:mot-de-passe")}`;

    expect(isWorkspaceAuthorized(authorization, "agence", "mot-de-passe")).toBe(true);
  });

  it("rejects absent, malformed, or incorrect credentials", () => {
    expect(isWorkspaceAuthorized(null, "agence", "mot-de-passe")).toBe(false);
    expect(isWorkspaceAuthorized("Bearer token", "agence", "mot-de-passe")).toBe(false);
    expect(isWorkspaceAuthorized(`Basic ${btoa("agence:incorrect")}`, "agence", "mot-de-passe")).toBe(false);
  });
});
