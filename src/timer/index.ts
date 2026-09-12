import { defineElement } from "../core/dom";
import { UITimerItem } from "./item";
import {
  UITimerActionTrigger,
  UITimerArea,
  UITimerControl,
  UITimerItemLabel,
  UITimerItemValue,
  UITimerSeparator,
} from "./parts";
import { UITimer } from "./root";

defineElement("ui-timer", UITimer);
defineElement("ui-timer-area", UITimerArea);
defineElement("ui-timer-control", UITimerControl);
defineElement("ui-timer-item", UITimerItem);
defineElement("ui-timer-item-value", UITimerItemValue);
defineElement("ui-timer-item-label", UITimerItemLabel);
defineElement("ui-timer-separator", UITimerSeparator);
defineElement("ui-timer-action-trigger", UITimerActionTrigger);

export {
  UITimer,
  UITimerActionTrigger,
  UITimerArea,
  UITimerControl,
  UITimerItem,
  UITimerItemLabel,
  UITimerItemValue,
  UITimerSeparator,
};
export type { Api, Props, TickDetails, Time, TimePart, TimerAction } from "@zag-js/timer";

declare global {
  interface HTMLElementTagNameMap {
    "ui-timer": UITimer;
    "ui-timer-area": UITimerArea;
    "ui-timer-control": UITimerControl;
    "ui-timer-item": UITimerItem;
    "ui-timer-item-value": UITimerItemValue;
    "ui-timer-item-label": UITimerItemLabel;
    "ui-timer-separator": UITimerSeparator;
    "ui-timer-action-trigger": UITimerActionTrigger;
  }
}
