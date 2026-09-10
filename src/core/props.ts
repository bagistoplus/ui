/**
 * Applying Zag props to a DOM node.
 *
 * This replaces `spreadProps` from `@zag-js/vanilla`, which remembers what it
 * last wrote and skips an attribute whose value has not changed. That is fine
 * until something else edits the DOM. A visual editor morph strips every
 * attribute the server did not send, which is all of them here, and the cache
 * then believes they are still in place and never writes them back. The node
 * loses its id and its data-scope, and Zag's own DOM queries stop finding it.
 *
 * So the comparison is against the live DOM. An attribute removed by anything
 * at all is restored on the next render.
 */
type Props = Record<string, unknown>;

interface Applied {
  attributes: Set<string>;
  listeners: Map<string, EventListener>;
  props: Props;
}

const applied = new WeakMap<Element, Map<string, Applied>>();

const PROPERTIES = new Set(["value", "checked", "selected"]);

export function applyProps(el: Element, props: Props, scope: string): void {
  let scopes = applied.get(el);

  if (!scopes) {
    scopes = new Map();
    applied.set(el, scopes);
  }

  let record = scopes.get(scope);

  if (!record) {
    record = { attributes: new Set(), listeners: new Map(), props };
    scopes.set(scope, record);
  }

  record.props = props;

  const next = new Set<string>();

  for (const key in props) {
    if (key.startsWith("on")) {
      bind(el, record, key);
      continue;
    }

    if (key === "children") {
      continue;
    }

    write(el, key, props[key]);
    next.add(key);
  }

  for (const name of record.attributes) {
    if (!next.has(name)) {
      el.removeAttribute(name.toLowerCase());
    }
  }

  record.attributes = next;
}

export function releaseProps(el: Element, scope: string): void {
  const record = applied.get(el)?.get(scope);

  if (!record) {
    return;
  }

  for (const [type, listener] of record.listeners) {
    el.removeEventListener(type, listener);
  }

  record.listeners.clear();
  applied.get(el)?.delete(scope);
}

/**
 * One stable listener per event, dispatching to whatever the latest render put
 * in props. Zag hands back fresh closures on every connect, so binding those
 * directly would mean removing and adding a listener on every render.
 */
function bind(el: Element, record: Applied, key: string): void {
  const type = key.slice(2).toLowerCase();

  if (record.listeners.has(type)) {
    return;
  }

  const listener: EventListener = (event) => {
    const handler = record.props[key];

    if (typeof handler === "function") {
      (handler as (event: Event) => void)(event);
    }
  };

  record.listeners.set(type, listener);
  el.addEventListener(type, listener);
}

/** Custom properties pass through untouched; everything else is camelCase. */
function styleToCss(style: Record<string, unknown>): string {
  const declarations: string[] = [];

  for (const key in style) {
    const value = style[key];

    if (value == null || value === "") {
      continue;
    }

    const name = key.startsWith("--") ? key : key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

    declarations.push(`${name}: ${String(value)}`);
  }

  return declarations.join("; ");
}

function write(el: Element, key: string, value: unknown): void {
  if (key === "class") {
    if (el.className !== value) {
      el.className = (value as string) ?? "";
    }

    return;
  }

  if (key === "style" && value !== null && typeof value === "object") {
    value = styleToCss(value as Record<string, unknown>);
  }

  if (PROPERTIES.has(key)) {
    const node = el as unknown as Record<string, unknown>;

    if (node[key] !== value) {
      node[key] = value ?? "";
    }

    return;
  }

  const name = key.toLowerCase();

  // Zag sends aria-expanded and friends as booleans, but they are enumerated
  // attributes whose value is the string, not attributes whose presence is the
  // value.
  if (typeof value === "boolean" && !name.startsWith("aria-")) {
    if (el.hasAttribute(name) !== value) {
      el.toggleAttribute(name, value);
    }

    return;
  }

  if (value == null) {
    if (el.hasAttribute(name)) {
      el.removeAttribute(name);
    }

    return;
  }

  const next = String(value);

  if (el.getAttribute(name) !== next) {
    el.setAttribute(name, next);
  }
}
