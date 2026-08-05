import { categoryLabels, type Service, type ServiceCategory } from "@/content/services";

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-CA")
    .trim();
}

export function filterServices(
  entries: Service[],
  query: string,
  categories: ServiceCategory[],
) {
  const normalizedQuery = normalizeSearch(query);
  return entries.filter((service) => {
    const searchable = normalizeSearch(
      [
        service.title,
        service.shortDescription,
        ...service.categories.map((category) => categoryLabels[category]),
      ].join(" "),
    );
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesCategory =
      categories.length === 0 || categories.some((category) => service.categories.includes(category));
    return matchesQuery && matchesCategory;
  });
}

