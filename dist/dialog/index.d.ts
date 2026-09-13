import { UIDialogBackdrop, UIDialogCloseTrigger, UIDialogContent, UIDialogDescription, UIDialogPositioner, UIDialogTitle, UIDialogTrigger } from "./parts";
import { UIDialog } from "./root";
export { UIDialog, UIDialogBackdrop, UIDialogCloseTrigger, UIDialogContent, UIDialogDescription, UIDialogPositioner, UIDialogTitle, UIDialogTrigger, };
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
//# sourceMappingURL=index.d.ts.map