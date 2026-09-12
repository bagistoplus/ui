import { defineElement } from "../core/dom";
import { UIBeforeAfterAfter, UIBeforeAfterBefore, UIBeforeAfterHandle, UIBeforeAfterSeparator } from "./parts";
import { UIBeforeAfter } from "./root";

defineElement("ui-before-after", UIBeforeAfter);
defineElement("ui-before-after-before", UIBeforeAfterBefore);
defineElement("ui-before-after-after", UIBeforeAfterAfter);
defineElement("ui-before-after-separator", UIBeforeAfterSeparator);
defineElement("ui-before-after-handle", UIBeforeAfterHandle);

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
