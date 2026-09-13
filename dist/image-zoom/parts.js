import { ZagPart } from "../core/part";
import { IMAGE_ZOOM_ROOT } from "./brands";
/** Every image zoom part registers with the root. */
class ImageZoomPart extends ZagPart {
    get ownerBrand() {
        return IMAGE_ZOOM_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/**
 * A trigger only works as a real `<button>` under `delegate`: Enter, Space,
 * the focus ring and disabled pointer blocking come from the element, not from
 * the machine. Warned once.
 */
class ButtonPart extends ImageZoomPart {
    #warned = false;
    render(api) {
        if (!this.delegation.enabled && !this.#warned) {
            this.#warned = true;
            console.warn(`[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
                "Without one it is not focusable and `disabled` blocks nothing.");
        }
        super.render(api);
    }
}
/**
 * The gesture surface. It is the box a pointer is measured against, so it
 * takes the size, and it clips the image at its edges.
 */
export class UIImageZoomViewport extends ImageZoomPart {
    get idKey() {
        return "viewport";
    }
    propsFor(api) {
        return api.getViewportProps();
    }
}
/** The element the transform lands on. Under `delegate`, the `<img>` itself. */
export class UIImageZoomImage extends ImageZoomPart {
    propsFor(api) {
        return api.getImageProps();
    }
}
export class UIImageZoomIncrementTrigger extends ButtonPart {
    propsFor(api) {
        return api.getIncrementTriggerProps();
    }
}
export class UIImageZoomDecrementTrigger extends ButtonPart {
    propsFor(api) {
        return api.getDecrementTriggerProps();
    }
}
export class UIImageZoomResetTrigger extends ButtonPart {
    propsFor(api) {
        return api.getResetTriggerProps();
    }
}
//# sourceMappingURL=parts.js.map