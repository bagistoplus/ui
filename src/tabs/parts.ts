import type * as tabs from "@zag-js/tabs";

import { ZagPart } from "../core/part";
import { TABS_ROOT } from "./brands";
import type { UITabs } from "./root";

type Props = Record<string, unknown>;

export type UITabsPart = ZagPart<tabs.Api, UITabs>;

/**
 * Every tabs part registers with the root.
 *
 * Unlike the accordion there is nothing in between: a trigger lives inside the
 * list and its panel is a sibling of the list, so the two are in different
 * subtrees and each carries its own `value`.
 */
abstract class TabsPart extends ZagPart<tabs.Api, UITabs> {
  protected get ownerBrand(): symbol {
    return TABS_ROOT;
  }

  protected register(owner: UITabs): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UITabs): void {
    owner.unregisterChild(this);
  }
}

/**
 * Not optional, and not decoration. Zag puts the arrow, Home and End handling
 * on the list, guarded by a `contains` check, so a trigger only responds to the
 * keyboard while it is a descendant of this element. Both trigger and content
 * also carry `data-ownedby` pointing at this element's id.
 */
export class UITabsList extends TabsPart {
  protected propsFor(api: tabs.Api): Props {
    return api.getListProps() as Props;
  }
}

export class UITabsTrigger extends TabsPart {
  static readonly observedAttributes = ["value", "disabled"];

  #warned = false;

  /**
   * Reflected, because a property assignment must reach the attribute.
   *
   * Any framework that renders these elements decides between `setAttribute`
   * and a property assignment by testing `key in el`, so declaring a getter is
   * what makes `value` a property in the first place. Without a setter the
   * write lands on a getter-only property and is lost, leaving the element with
   * no value at all: Vue's client-side render does exactly this, so the markup
   * works from server HTML and silently does nothing after a route change.
   */
  get value(): string | null {
    return this.getAttribute("value");
  }

  set value(next: string | null) {
    if (next == null) {
      this.removeAttribute("value");
      return;
    }

    this.setAttribute("value", next);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(next: boolean) {
    this.toggleAttribute("disabled", Boolean(next));
  }

  protected propsFor(api: tabs.Api): Props | null {
    const value = this.value;

    return value ? (api.getTriggerProps({ value, disabled: this.disabled }) as Props) : null;
  }

  /**
   * Zag hands this part a roving `tabindex`, so a plain container is reachable
   * with the arrow keys. What it has no handler for at all is activation:
   * `getTriggerProps` returns `onClick`, `onFocus` and `onBlur` and no key
   * handler, so nothing turns Enter or Space into a click except a real
   * `<button>`. A container trigger can be focused and never used.
   */
  override render(api: tabs.Api): void {
    if (!this.delegation.enabled && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
          `Without one the arrow keys reach it but Enter and Space cannot activate it.`,
      );
    }

    super.render(api);
  }
}

export class UITabsContent extends TabsPart {
  static readonly observedAttributes = ["value"];

  /** Reflected, for the reason given on the trigger. */
  get value(): string | null {
    return this.getAttribute("value");
  }

  set value(next: string | null) {
    if (next == null) {
      this.removeAttribute("value");
      return;
    }

    this.setAttribute("value", next);
  }

  protected propsFor(api: tabs.Api): Props | null {
    const value = this.value;

    return value ? (api.getContentProps({ value }) as Props) : null;
  }
}

/**
 * A single element for the whole component, not one per tab. Zag measures the
 * selected trigger and writes the rect out as custom properties, so the CSS
 * that draws it is entirely yours: this part supplies `--left`, `--top`,
 * `--width` and `--height`, plus `position: absolute`.
 */
export class UITabsIndicator extends TabsPart {
  protected propsFor(api: tabs.Api): Props {
    return api.getIndicatorProps() as Props;
  }
}
