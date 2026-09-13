import { ZagPart } from "../core/part";
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
declare abstract class BeforeAfterPart extends ZagPart<Api, UIBeforeAfter> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIBeforeAfter): void;
    protected unregister(owner: UIBeforeAfter): void;
}
/** The slot clipped from the start edge to the handle. */
export declare class UIBeforeAfterBefore extends BeforeAfterPart {
    protected propsFor(api: Api): Props;
}
/** The slot clipped from the handle to the end edge. */
export declare class UIBeforeAfterAfter extends BeforeAfterPart {
    protected propsFor(api: Api): Props;
}
export declare class UIBeforeAfterSeparator extends BeforeAfterPart {
    protected propsFor(api: Api): Props;
}
export declare class UIBeforeAfterHandle extends BeforeAfterPart {
    protected get idKey(): string;
    protected propsFor(api: Api): Props;
}
export {};
//# sourceMappingURL=parts.d.ts.map