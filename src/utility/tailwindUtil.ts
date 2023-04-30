/** Merges multiple TailwindCSS class names together. */
export function tw(...classNames: string[]) { return classNames.map(c => c.trim()).join(" "); }