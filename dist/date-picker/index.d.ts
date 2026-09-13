import { UIDatePickerTableBody, UIDatePickerTableCell, UIDatePickerTableCellTrigger, UIDatePickerTableHead, UIDatePickerTableHeader, UIDatePickerTableRow } from "./grid";
import { UIDatePickerClearTrigger, UIDatePickerContent, UIDatePickerControl, UIDatePickerInput, UIDatePickerLabel, UIDatePickerMonthSelect, UIDatePickerNextTrigger, UIDatePickerPositioner, UIDatePickerPresetTrigger, UIDatePickerPrevTrigger, UIDatePickerRangeText, UIDatePickerTrigger, UIDatePickerViewControl, UIDatePickerViewTrigger, UIDatePickerYearSelect } from "./parts";
import { UIDatePicker } from "./root";
import { UIDatePickerTable } from "./table";
import { UIDatePickerView } from "./view";
export { UIDatePicker, UIDatePickerClearTrigger, UIDatePickerContent, UIDatePickerControl, UIDatePickerInput, UIDatePickerLabel, UIDatePickerMonthSelect, UIDatePickerNextTrigger, UIDatePickerPositioner, UIDatePickerPresetTrigger, UIDatePickerPrevTrigger, UIDatePickerRangeText, UIDatePickerTable, UIDatePickerTableBody, UIDatePickerTableCell, UIDatePickerTableCellTrigger, UIDatePickerTableHead, UIDatePickerTableHeader, UIDatePickerTableRow, UIDatePickerTrigger, UIDatePickerView, UIDatePickerViewControl, UIDatePickerViewTrigger, UIDatePickerYearSelect, };
export type { Api, DateValue, DateView, FocusChangeDetails, OpenChangeDetails, Props, SelectionMode, ValueChangeDetails, ViewChangeDetails, VisibleRangeChangeDetails, } from "@zag-js/date-picker";
declare global {
    interface HTMLElementTagNameMap {
        "ui-date-picker": UIDatePicker;
        "ui-date-picker-label": UIDatePickerLabel;
        "ui-date-picker-control": UIDatePickerControl;
        "ui-date-picker-input": UIDatePickerInput;
        "ui-date-picker-trigger": UIDatePickerTrigger;
        "ui-date-picker-clear-trigger": UIDatePickerClearTrigger;
        "ui-date-picker-positioner": UIDatePickerPositioner;
        "ui-date-picker-content": UIDatePickerContent;
        "ui-date-picker-view": UIDatePickerView;
        "ui-date-picker-view-control": UIDatePickerViewControl;
        "ui-date-picker-view-trigger": UIDatePickerViewTrigger;
        "ui-date-picker-prev-trigger": UIDatePickerPrevTrigger;
        "ui-date-picker-next-trigger": UIDatePickerNextTrigger;
        "ui-date-picker-range-text": UIDatePickerRangeText;
        "ui-date-picker-table": UIDatePickerTable;
        "ui-date-picker-table-head": UIDatePickerTableHead;
        "ui-date-picker-table-body": UIDatePickerTableBody;
        "ui-date-picker-table-row": UIDatePickerTableRow;
        "ui-date-picker-table-header": UIDatePickerTableHeader;
        "ui-date-picker-table-cell": UIDatePickerTableCell;
        "ui-date-picker-table-cell-trigger": UIDatePickerTableCellTrigger;
        "ui-date-picker-month-select": UIDatePickerMonthSelect;
        "ui-date-picker-year-select": UIDatePickerYearSelect;
        "ui-date-picker-preset-trigger": UIDatePickerPresetTrigger;
    }
}
//# sourceMappingURL=index.d.ts.map