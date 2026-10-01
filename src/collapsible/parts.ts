import type * as collapsible from "@zag-js/collapsible";

import { ZagPart } from "../core/part";
import { COLLAPSIBLE_ROOT } from "./brands";
import type { UICollapsible } from "./root";

type Props = Record<string, unknown>;

/** Every part registers with the root. There is nothing in between. */
abstract class CollapsiblePart extends ZagPart<collapsible.Api, UICollapsible> {
  protected get ownerBrand(): symbol {
    return COLLAPSIBLE_ROOT;
  }

  protected register(owner: UICollapsible): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UICollapsible): void {
    owner.unregisterChild(this);
  }
}

export class UICollapsibleTrigger extends CollapsiblePart {
  #warned = false;

  protected override get idKey(): string {
    return "trigger";
  }

  protected propsFor(api: collapsible.Api): Props {
    return api.getTriggerProps() as Props;
  }

  /**
   * Zag's trigger props carry `type="button"`, `aria-expanded` and a click
   * handler, and no `tabindex` at all. So a container trigger is not merely
   * awkward, it is unreachable: nothing focuses it and nothing turns Enter or
   * Space into a click except a real `<button>`.
   */
  override render(api: collapsible.Api): void {
    if (!this.delegation.enabled && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
          `Without one it is not focusable and the keyboard cannot reach it.`,
      );
    }

    super.render(api);
  }
}

/** A styling hook for whatever marks the open state, such as a rotating chevron. */
export class UICollapsibleIndicator extends CollapsiblePart {
  protected propsFor(api: collapsible.Api): Props {
    return api.getIndicatorProps() as Props;
  }
}

/**
 * The one element the machine looks up. It measures this element for
 * `--height` and `--width`, waits for its exit animation, and marks its
 * tabbable descendants `inert` while a collapsed size clips it, all by the id
 * Zag gives it. So it carries that id, or the one its consumer wrote.
 *
 * Only a CSS animation holds it open while closing: Zag reads `animationName`
 * and waits for `animationend`. A transition is not seen, and the panel is
 * hidden on the next frame.
 */
export class UICollapsibleContent extends CollapsiblePart {
  protected override get idKey(): string {
    return "content";
  }

  protected propsFor(api: collapsible.Api): Props {
    return api.getContentProps() as Props;
  }
}
