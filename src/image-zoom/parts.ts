import { ZagPart } from "../core/part";
import { IMAGE_ZOOM_ROOT } from "./brands";
import type { Api } from "./machine";
import type { UIImageZoom } from "./root";

type Props = Record<string, unknown>;

export type UIImageZoomPart = ZagPart<Api, UIImageZoom>;

/** Every image zoom part registers with the root. */
abstract class ImageZoomPart extends ZagPart<Api, UIImageZoom> {
  protected get ownerBrand(): symbol {
    return IMAGE_ZOOM_ROOT;
  }

  protected register(owner: UIImageZoom): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UIImageZoom): void {
    owner.unregisterChild(this);
  }
}

/**
 * A trigger only works as a real `<button>` under `delegate`: Enter, Space,
 * the focus ring and disabled pointer blocking come from the element, not from
 * the machine. Warned once.
 */
abstract class ButtonPart extends ImageZoomPart {
  #warned = false;

  override render(api: Api): void {
    if (!this.delegation.enabled && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
          "Without one it is not focusable and `disabled` blocks nothing.",
      );
    }

    super.render(api);
  }
}

/**
 * The gesture surface. It is the box a pointer is measured against, so it
 * takes the size, and it clips the image at its edges.
 */
export class UIImageZoomViewport extends ImageZoomPart {
  protected override get idKey(): string {
    return "viewport";
  }

  protected propsFor(api: Api): Props {
    return api.getViewportProps();
  }
}

/** The element the transform lands on. Under `delegate`, the `<img>` itself. */
export class UIImageZoomImage extends ImageZoomPart {
  protected propsFor(api: Api): Props {
    return api.getImageProps();
  }
}

export class UIImageZoomIncrementTrigger extends ButtonPart {
  protected propsFor(api: Api): Props {
    return api.getIncrementTriggerProps();
  }
}

export class UIImageZoomDecrementTrigger extends ButtonPart {
  protected propsFor(api: Api): Props {
    return api.getDecrementTriggerProps();
  }
}

export class UIImageZoomResetTrigger extends ButtonPart {
  protected propsFor(api: Api): Props {
    return api.getResetTriggerProps();
  }
}
