/**
 * DOM helpers shared by every component.
 *
 * Nothing here knows about a particular component, and nothing references a
 * tag name: a page can load the package twice, which breaks `instanceof`, and
 * the registration name is the one thing a consumer may have to change to dodge
 * a collision in the global custom element registry.
 */
export function findBranded<T>(start: Element, brand: symbol): T | null {
  for (let node = start.parentElement; node; node = node.parentElement) {
    if ((node as unknown as Record<symbol, unknown>)[brand] === true) {
      return node as unknown as T;
    }
  }

  return null;
}

export function listAttribute(value: string | null): string[] | undefined {
  if (value == null) {
    return undefined;
  }

  const items = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

export function readDirection(el: Element): "ltr" | "rtl" {
  return el.closest("[dir]")?.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}

/**
 * Custom element names are a global registry. Losing the race is silent unless
 * we say so, and a silent loss looks like the package simply not working.
 */
export function defineElement(name: string, ctor: CustomElementConstructor): void {
  const existing = customElements.get(name);

  if (existing === ctor) {
    return;
  }

  if (existing) {
    console.warn(
      `[@bagistoplus/ui] <${name}> is already registered by something else. ` +
        `The @bagistoplus/ui element was not installed and will not work.`,
    );
    return;
  }

  customElements.define(name, ctor);
}
