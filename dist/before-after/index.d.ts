import { UIBeforeAfterAfter, UIBeforeAfterBefore, UIBeforeAfterHandle, UIBeforeAfterSeparator } from "./parts";
import { UIBeforeAfter } from "./root";
export { UIBeforeAfter, UIBeforeAfterAfter, UIBeforeAfterBefore, UIBeforeAfterHandle, UIBeforeAfterSeparator };
export type { Api, Direction, Orientation, Props, ValueChangeDetails } from "./machine";
declare global {
    interface HTMLElementTagNameMap {
        "ui-before-after": UIBeforeAfter;
        "ui-before-after-before": UIBeforeAfterBefore;
        "ui-before-after-after": UIBeforeAfterAfter;
        "ui-before-after-separator": UIBeforeAfterSeparator;
        "ui-before-after-handle": UIBeforeAfterHandle;
    }
}
//# sourceMappingURL=index.d.ts.map