import { defineElement } from "../core/dom";
import { UIRatingControl, UIRatingHiddenInput, UIRatingItem, UIRatingLabel } from "./parts";
import { UIRating } from "./root";

defineElement("ui-rating", UIRating);
defineElement("ui-rating-label", UIRatingLabel);
defineElement("ui-rating-control", UIRatingControl);
defineElement("ui-rating-item", UIRatingItem);
defineElement("ui-rating-hidden-input", UIRatingHiddenInput);

export { UIRating, UIRatingControl, UIRatingHiddenInput, UIRatingItem, UIRatingLabel };

export type { RatingValueText, RatingValueTextDetails } from "./root";

declare global {
  interface HTMLElementTagNameMap {
    "ui-rating": UIRating;
    "ui-rating-label": UIRatingLabel;
    "ui-rating-control": UIRatingControl;
    "ui-rating-item": UIRatingItem;
    "ui-rating-hidden-input": UIRatingHiddenInput;
  }
}
