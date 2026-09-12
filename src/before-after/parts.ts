import { ZagPart } from "../core/part";
import { BEFORE_AFTER_ROOT } from "./brands";
import type { Api } from "./machine";
import type { UIBeforeAfter } from "./root";

type Props = Record<string, unknown>;

export type UIBeforeAfterPart = ZagPart<Api, UIBeforeAfter>;

/**
 * Every before/after part registers with the root. All four are containers:
 * the machine positions them inside the root's box, and the handle carries
 * `role="slider"`, `tabindex` and the key handler, which a custom element holds
 * as well as a `<div>` does.
 */
abstract class BeforeAfterPart extends ZagPart<Api, UIBeforeAfter> {
  protected get ownerBrand(): symbol {
    return BEFORE_AFTER_ROOT;
  }

  protected register(owner: UIBeforeAfter): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UIBeforeAfter): void {
    owner.unregisterChild(this);
  }
}

/** The slot clipped from the start edge to the handle. */
export class UIBeforeAfterBefore extends BeforeAfterPart {
  protected propsFor(api: Api): Props {
    return api.getBeforeProps();
  }
}

/** The slot clipped from the handle to the end edge. */
export class UIBeforeAfterAfter extends BeforeAfterPart {
  protected propsFor(api: Api): Props {
    return api.getAfterProps();
  }
}

export class UIBeforeAfterSeparator extends BeforeAfterPart {
  protected propsFor(api: Api): Props {
    return api.getSeparatorProps();
  }
}

export class UIBeforeAfterHandle extends BeforeAfterPart {
  protected override get idKey(): string {
    return "handle";
  }

  protected propsFor(api: Api): Props {
    return api.getHandleProps();
  }
}
