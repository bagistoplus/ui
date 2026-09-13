import { ZagPart } from "../core/part";
import type { Api } from "./machine";
import type { UIImageZoom } from "./root";
type Props = Record<string, unknown>;
export type UIImageZoomPart = ZagPart<Api, UIImageZoom>;
/** Every image zoom part registers with the root. */
declare abstract class ImageZoomPart extends ZagPart<Api, UIImageZoom> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIImageZoom): void;
    protected unregister(owner: UIImageZoom): void;
}
/**
 * A trigger only works as a real `<button>` under `delegate`: Enter, Space,
 * the focus ring and disabled pointer blocking come from the element, not from
 * the machine. Warned once.
 */
declare abstract class ButtonPart extends ImageZoomPart {
    #private;
    render(api: Api): void;
}
/**
 * The gesture surface. It is the box a pointer is measured against, so it
 * takes the size, and it clips the image at its edges.
 */
export declare class UIImageZoomViewport extends ImageZoomPart {
    protected get idKey(): string;
    protected propsFor(api: Api): Props;
}
/** The element the transform lands on. Under `delegate`, the `<img>` itself. */
export declare class UIImageZoomImage extends ImageZoomPart {
    protected propsFor(api: Api): Props;
}
export declare class UIImageZoomIncrementTrigger extends ButtonPart {
    protected propsFor(api: Api): Props;
}
export declare class UIImageZoomDecrementTrigger extends ButtonPart {
    protected propsFor(api: Api): Props;
}
export declare class UIImageZoomResetTrigger extends ButtonPart {
    protected propsFor(api: Api): Props;
}
export {};
//# sourceMappingURL=parts.d.ts.map