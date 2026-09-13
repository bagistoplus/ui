import { defineElement } from "../core/dom";
import {
  UIDatePickerTableBody,
  UIDatePickerTableCell,
  UIDatePickerTableCellTrigger,
  UIDatePickerTableHead,
  UIDatePickerTableHeader,
  UIDatePickerTableRow,
} from "./grid";
import {
  UIDatePickerClearTrigger,
  UIDatePickerContent,
  UIDatePickerControl,
  UIDatePickerInput,
  UIDatePickerLabel,
  UIDatePickerMonthSelect,
  UIDatePickerNextTrigger,
  UIDatePickerPositioner,
  UIDatePickerPresetTrigger,
  UIDatePickerPrevTrigger,
  UIDatePickerRangeText,
  UIDatePickerTrigger,
  UIDatePickerViewControl,
  UIDatePickerViewTrigger,
  UIDatePickerYearSelect,
} from "./parts";
import { UIDatePicker } from "./root";
import { UIDatePickerTable } from "./table";
import { UIDatePickerView } from "./view";

defineElement("ui-date-picker", UIDatePicker);
defineElement("ui-date-picker-label", UIDatePickerLabel);
defineElement("ui-date-picker-control", UIDatePickerControl);
defineElement("ui-date-picker-input", UIDatePickerInput);
defineElement("ui-date-picker-trigger", UIDatePickerTrigger);
defineElement("ui-date-picker-clear-trigger", UIDatePickerClearTrigger);
defineElement("ui-date-picker-positioner", UIDatePickerPositioner);
defineElement("ui-date-picker-content", UIDatePickerContent);
defineElement("ui-date-picker-view", UIDatePickerView);
defineElement("ui-date-picker-view-control", UIDatePickerViewControl);
defineElement("ui-date-picker-view-trigger", UIDatePickerViewTrigger);
defineElement("ui-date-picker-prev-trigger", UIDatePickerPrevTrigger);
defineElement("ui-date-picker-next-trigger", UIDatePickerNextTrigger);
defineElement("ui-date-picker-range-text", UIDatePickerRangeText);
defineElement("ui-date-picker-table", UIDatePickerTable);
defineElement("ui-date-picker-table-head", UIDatePickerTableHead);
defineElement("ui-date-picker-table-body", UIDatePickerTableBody);
defineElement("ui-date-picker-table-row", UIDatePickerTableRow);
defineElement("ui-date-picker-table-header", UIDatePickerTableHeader);
defineElement("ui-date-picker-table-cell", UIDatePickerTableCell);
defineElement("ui-date-picker-table-cell-trigger", UIDatePickerTableCellTrigger);
defineElement("ui-date-picker-month-select", UIDatePickerMonthSelect);
defineElement("ui-date-picker-year-select", UIDatePickerYearSelect);
defineElement("ui-date-picker-preset-trigger", UIDatePickerPresetTrigger);

export {
  UIDatePicker,
  UIDatePickerClearTrigger,
  UIDatePickerContent,
  UIDatePickerControl,
  UIDatePickerInput,
  UIDatePickerLabel,
  UIDatePickerMonthSelect,
  UIDatePickerNextTrigger,
  UIDatePickerPositioner,
  UIDatePickerPresetTrigger,
  UIDatePickerPrevTrigger,
  UIDatePickerRangeText,
  UIDatePickerTable,
  UIDatePickerTableBody,
  UIDatePickerTableCell,
  UIDatePickerTableCellTrigger,
  UIDatePickerTableHead,
  UIDatePickerTableHeader,
  UIDatePickerTableRow,
  UIDatePickerTrigger,
  UIDatePickerView,
  UIDatePickerViewControl,
  UIDatePickerViewTrigger,
  UIDatePickerYearSelect,
};
export type {
  Api,
  DateValue,
  DateView,
  FocusChangeDetails,
  OpenChangeDetails,
  Props,
  SelectionMode,
  ValueChangeDetails,
  ViewChangeDetails,
  VisibleRangeChangeDetails,
} from "@zag-js/date-picker";

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
