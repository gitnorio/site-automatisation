import { describe, expect, it } from "vitest";

import { services } from "@/content/services";
import { filterServices, normalizeSearch } from "@/lib/service-filter";

describe("service filtering", () => {
  it("normalizes accents and case", () => {
    expect(normalizeSearch("  INTÉGRATION  ")).toBe("integration");
  });

  it("finds a service without requiring accents", () => {
    const results = filterServices(services, "connaissances", []);
    expect(results.some((service) => service.slug === "bases-de-connaissances")).toBe(true);
  });

  it("combines search and selected categories", () => {
    const results = filterServices(services, "documents", ["automatisation"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((service) => service.categories.includes("automatisation"))).toBe(true);
  });

  it("returns all services when criteria are empty", () => {
    expect(filterServices(services, "", [])).toHaveLength(11);
  });
});

