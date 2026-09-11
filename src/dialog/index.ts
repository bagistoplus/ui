import { defineElement } from "../core/dom";
import {
  UIDialogBackdrop,
  UIDialogCloseTrigger,
  UIDialogContent,
  UIDialogDescription,
  UIDialogPositioner,
  UIDialogTitle,
  UIDialogTrigger,
} from "./parts";
import { UIDialog } from "./root";

defineElement("ui-dialog", UIDialog);
defineElement("ui-dialog-trigger", UIDialogTrigger);
defineElement("ui-dialog-backdrop", UIDialogBackdrop);
defineElement("ui-dialog-positioner", UIDialogPositioner);
defineElement("ui-dialog-content", UIDialogContent);
defineElement("ui-dialog-title", UIDialogTitle);
defineElement("ui-dialog-description", UIDialogDescription);
defineElement("ui-dialog-close-trigger", UIDialogCloseTrigger);

export {
  UIDialog,
  UIDialogBackdrop,
  UIDialogCloseTrigger,
  UIDialogContent,
  UIDialogDescription,
  UIDialogPositioner,
  UIDialogTitle,
  UIDialogTrigger,
};

declare global {
  interface HTMLElementTagNameMap {
    "ui-dialog": UIDialog;
    "ui-dialog-trigger": UIDialogTrigger;
    "ui-dialog-backdrop": UIDialogBackdrop;
    "ui-dialog-positioner": UIDialogPositioner;
    "ui-dialog-content": UIDialogContent;
    "ui-dialog-title": UIDialogTitle;
    "ui-dialog-description": UIDialogDescription;
    "ui-dialog-close-trigger": UIDialogCloseTrigger;
  }
}
