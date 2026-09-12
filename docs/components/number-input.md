# Number Input

A text field for a number, with a button on each side to step it.

## Features

- ✅ Arrow keys step, Shift steps big, Alt steps small, Home and End go to the bounds
- ✅ Holding a button spins
- ✅ Bounds, and a value that is clamped when the field loses focus
- ✅ Locale aware parsing and formatting through `Intl.NumberFormat`
- ✅ Follows a disabled `<fieldset>`
- ✅ Submits with its form through the real `<input name>` inside it
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/number-input";
```

## Examples

### Basic

A quantity between one and five. Click a button, or focus the field and press the arrow keys.

<ComponentExample>

<ui-number-input default-value="1" min="1" max="5" translations-increment-label="Add one" translations-decrement-label="Remove one" class="inline-flex items-center gap-3">
  <ui-number-input-label delegate>
    <label class="text-sm font-medium">Quantity</label>
  </ui-number-input-label>
  <ui-number-input-control class="inline-flex items-center rounded-md border border-gray-300 dark:border-zinc-700">
    <ui-number-input-decrement-trigger delegate>
      <button class="cursor-pointer border-0 bg-transparent px-3 py-1 text-lg disabled:cursor-default disabled:opacity-40">−</button>
    </ui-number-input-decrement-trigger>
    <ui-number-input-input delegate>
      <input class="w-12 border-0 bg-transparent text-center outline-none">
    </ui-number-input-input>
    <ui-number-input-increment-trigger delegate>
      <button class="cursor-pointer border-0 bg-transparent px-3 py-1 text-lg disabled:cursor-default disabled:opacity-40">+</button>
    </ui-number-input-increment-trigger>
  </ui-number-input-control>
</ui-number-input>

</ComponentExample>

::: tip Try it
Type `9` and press Tab. The field clamps to `5` when it loses focus, not while you type, so a value you are still writing is never changed under you.
:::

### A price

Two fraction digits, grouped, in the language of the page. With `lang="de"` on the wrapper the field shows `1.234,50` and accepts a comma as the separator. Note the `default-value`: once the field formats, a value is written the way the locale writes it.

<ComponentExample>

<div lang="de">
<ui-number-input default-value="1234,5" min="0" step="0.5" minimum-fraction-digits="2" maximum-fraction-digits="2" use-grouping class="inline-flex items-center gap-3">
  <ui-number-input-label delegate>
    <label class="text-sm font-medium">Preis</label>
  </ui-number-input-label>
  <ui-number-input-control class="inline-flex items-center rounded-md border border-gray-300 dark:border-zinc-700">
    <ui-number-input-decrement-trigger delegate>
      <button class="cursor-pointer border-0 bg-transparent px-3 py-1 text-lg disabled:cursor-default disabled:opacity-40">−</button>
    </ui-number-input-decrement-trigger>
    <ui-number-input-input delegate>
      <input class="w-28 border-0 bg-transparent text-center outline-none">
    </ui-number-input-input>
    <ui-number-input-increment-trigger delegate>
      <button class="cursor-pointer border-0 bg-transparent px-3 py-1 text-lg disabled:cursor-default disabled:opacity-40">+</button>
    </ui-number-input-increment-trigger>
  </ui-number-input-control>
</ui-number-input>
</div>

</ComponentExample>

### Disabled and read-only

`disabled` disables the field and both buttons. `readonly` keeps the field focusable and readable, and locks the buttons.

<ComponentExample>

<div class="flex flex-wrap gap-6">
<ui-number-input default-value="2" disabled class="inline-flex items-center gap-3">
  <ui-number-input-label delegate><label class="text-sm font-medium">Disabled</label></ui-number-input-label>
  <ui-number-input-control class="inline-flex items-center rounded-md border border-gray-300 data-[disabled]:opacity-50 dark:border-zinc-700">
    <ui-number-input-decrement-trigger delegate><button class="border-0 bg-transparent px-3 py-1 text-lg">−</button></ui-number-input-decrement-trigger>
    <ui-number-input-input delegate><input class="w-12 border-0 bg-transparent text-center outline-none"></ui-number-input-input>
    <ui-number-input-increment-trigger delegate><button class="border-0 bg-transparent px-3 py-1 text-lg">+</button></ui-number-input-increment-trigger>
  </ui-number-input-control>
</ui-number-input>
<ui-number-input default-value="2" readonly class="inline-flex items-center gap-3">
  <ui-number-input-label delegate><label class="text-sm font-medium">Read-only</label></ui-number-input-label>
  <ui-number-input-control class="inline-flex items-center rounded-md border border-gray-300 dark:border-zinc-700">
    <ui-number-input-decrement-trigger delegate><button class="border-0 bg-transparent px-3 py-1 text-lg disabled:opacity-40">−</button></ui-number-input-decrement-trigger>
    <ui-number-input-input delegate><input class="w-12 border-0 bg-transparent text-center outline-none"></ui-number-input-input>
    <ui-number-input-increment-trigger delegate><button class="border-0 bg-transparent px-3 py-1 text-lg disabled:opacity-40">+</button></ui-number-input-increment-trigger>
  </ui-number-input-control>
</ui-number-input>
</div>

</ComponentExample>

### Controlled

With `value` set, the machine reports every change through `ui-number-input:value-change` but does not move. The value moves when the attribute does.

```html
<ui-number-input value="2" min="1" max="5">…</ui-number-input>

<script>
  const field = document.querySelector("ui-number-input");

  field.addEventListener("ui-number-input:value-change", (event) => {
    field.setAttribute("value", event.detail.value);
  });
</script>
```

### In a form

The `<input>` inside the field is the one the form submits. `name` and `form` on the root land on it.

```html
<form>
  <ui-number-input default-value="1" min="1" name="quantity">…</ui-number-input>
  <button>Add to cart</button>
</form>
```

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-number-input` | Owns the machine, `el.api` and the events |
| `ui-number-input-label` | Always `delegate`, wrapping a real `<label>`. Zag writes `for` on it |
| `ui-number-input-control` | `role="group"`. Groups the field and its buttons |
| `ui-number-input-input` | Always `delegate`, wrapping a real `<input>`. The field the machine reads and writes |
| `ui-number-input-increment-trigger` | Always `delegate`, wrapping a real `<button>` |
| `ui-number-input-decrement-trigger` | Always `delegate`, wrapping a real `<button>` |
| `ui-number-input-value-text` | Optional. Carries the state of the field as data attributes |
| `ui-number-input-scrubber` | Optional. A handle that changes the value when dragged, with pointer lock |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

**Four parts must be `delegate`.** Zag reads what the user typed from the field, writes the formatted value back into it, and names it for the form; a custom element can be none of that. The label needs `for` to focus the field on click, and only a real `<button>` blocks the pointer while disabled.

### Attributes on `ui-number-input`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string | none | The controlled value. While set, the machine reports changes and waits for the attribute to move. Written in the field's format, see below |
| `default-value` | string | none | The value on first render. Read once, at machine start. Written in the field's format, see below |
| `min` | number | none | Lower bound |
| `max` | number | none | Upper bound |
| `step` | number | `1` | The step for the buttons and the arrow keys |
| `large-step` | number | `10 × step` | The step with Shift held |
| `small-step` | number | `step / 10` | The step with Alt held |
| `name` | string | none | Lands on the `<input>`, for the form |
| `form` | string | none | Lands on the `<input>`. The id of the form it belongs to |
| `disabled` | boolean | absent | Disables the field and the buttons. A disabled `<fieldset>` ancestor does the same |
| `readonly` | boolean | absent | The field can be focused and read, the buttons are locked |
| `required` | boolean | absent | Lands on the `<input>` |
| `invalid` | boolean | absent | Forces the invalid state. Absent, the state follows the bounds |
| `pattern` | string | Zag's | The `pattern` on the `<input>`. Not written once a format attribute is set |
| `input-mode` | `text` \| `tel` \| `numeric` \| `decimal` | `decimal` | The keyboard a phone shows |
| `allow-mouse-wheel` | boolean | absent | The wheel steps the value while the field is focused |
| `allow-overflow` | boolean | absent | Lets the value leave the bounds. With it, the buttons never disable and the state turns invalid instead |
| `clamp-value-on-blur` | boolean | `true` | Brings a typed value back inside the bounds when the field loses focus |
| `focus-input-on-change` | boolean | `true` | A button press focuses the field |
| `spin-on-press` | boolean | `true` | Holding a button keeps stepping |
| `minimum-fraction-digits` | number | none | `Intl.NumberFormat` option. See below |
| `maximum-fraction-digits` | number | none | `Intl.NumberFormat` option. See below |
| `use-grouping` | boolean | none | `Intl.NumberFormat` option. See below |
| `locale` | string | inherited | The locale for parsing and formatting. See below |
| `translations-increment-label` | string | Zag's | `aria-label` on the increment button |
| `translations-decrement-label` | string | Zag's | `aria-label` on the decrement button |
| `delegate` | boolean | absent | Applies Zag's props to the single element child instead of to this element. Available on every element in the anatomy |
| `dir` | `ltr` \| `rtl` | inherited | Taken from the nearest `[dir]` ancestor, including self |
| `id` | string | generated | Kept, and used as Zag's root id |

Every attribute is observed. Changing one updates the machine in place, so the value survives.

Every boolean attribute reads three ways. Absent means "use Zag's default", present means `true`, and the literal value `"false"` means `false`. That last form is how you turn off a prop whose default is `true`, such as `spin-on-press="false"`.

### Formatting and the locale

Zag formats and parses through `Intl.NumberFormat` only once it has format options. Without any of the three format attributes the field holds the number as JavaScript prints it: no grouping, a dot as the separator, whatever the locale. That is also the mode in which `pattern` is written on the `<input>`.

Set any of `minimum-fraction-digits`, `maximum-fraction-digits` or `use-grouping` and the field formats in its locale: `1,000` in English, `1.000` in German, and the parser accepts the locale's separator. A typed character the parser rejects never lands, so with `maximum-fraction-digits="0"` a decimal separator cannot be typed at all. `value` and `default-value` go through the same parser, so `1234.5` under `lang="de"` reads as twelve thousand: write `1234,5`. A locale whose digits are not `0` to `9`, such as `ar`, formats with its own digits, and the parser accepts both.

The three attributes carry the `Intl` names without an object prefix, unlike `translations-*`. They are a curated three out of an `Intl` option set, not a Zag object, and `format-options-maximum-fraction-digits` is too long to write in a template.

The locale is the `locale` attribute, or without it the nearest `lang` ancestor, the way `dir` is read. With neither, Zag uses `en-US`.

### Naming the parts

Write an `id` on the root, the label, the field, a button or the scrubber and the component keeps it, telling Zag to generate that name instead of its own. With `delegate`, the id goes on the child, because the child is the element Zag names.

```html
<ui-number-input id="qty" default-value="1">
  <ui-number-input-label delegate><label id="qty-label">Quantity</label></ui-number-input-label>
  <ui-number-input-input delegate><input id="qty-field"></ui-number-input-input>
</ui-number-input>
```

An `aria-label` written on the `<input>` is left alone. Zag names the field only through the label part.

### `el.api`

Available on `ui-number-input` only. Parts reach it with `el.closest("ui-number-input").api`.

```js
const field = document.querySelector("ui-number-input");

field.api.value;          // the formatted value, a string
field.api.valueAsNumber;  // the value as a number, NaN when empty
field.api.empty;
field.api.invalid;
field.api.focused;
field.api.setValue(3);
field.api.clearValue();
field.api.increment();
field.api.decrement();
field.api.setToMax();
field.api.setToMin();
field.api.focus();
```

There is no `value` property on the element. The attribute is the controlled prop, and the live value is the api's.

### Events

All bubble, and carry Zag's details object.

| Event | Detail | When |
|-------|--------|------|
| `ui-number-input:value-change` | `{ value, valueAsNumber }` | Every keystroke, button press and api call that changes the value |
| `ui-number-input:value-commit` | `{ value, valueAsNumber }` | The field loses focus, or Enter is pressed. Not on a button press |
| `ui-number-input:value-invalid` | `{ value, valueAsNumber, reason }` | The value leaves the bounds. `reason` is `rangeUnderflow` or `rangeOverflow` |
| `ui-number-input:focus-change` | `{ value, valueAsNumber, focused }` | The field gains or loses focus |

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-number-input` | `root` | `dir`, `id`, `data-disabled`, `data-focus`, `data-invalid`, `data-scrubbing` |
| the label's `<label>` | `label` | `for`, `data-disabled`, `data-focus`, `data-invalid`, `data-required`, `id` |
| `ui-number-input-control` | `control` | `role="group"`, `aria-disabled`, `aria-invalid`, `data-disabled`, `data-focus`, `data-invalid` |
| the field's `<input>` | `input` | `role="spinbutton"`, `type="text"`, `name`, `form`, `inputmode`, `pattern`, `autocomplete="off"`, `disabled`, `readonly`, `required`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`, `aria-invalid`, `data-invalid`, `id` |
| the buttons | `increment-trigger`, `decrement-trigger` | `type="button"`, `disabled`, `aria-label`, `aria-controls`, `tabindex="-1"`, `data-disabled`, `id` |
| `ui-number-input-value-text` | `value-text` | `data-disabled`, `data-invalid`, `data-focus` |
| `ui-number-input-scrubber` | `scrubber` | `role="presentation"`, `data-disabled`, `data-scrubbing`, `id` |

The buttons are `tabindex="-1"`: the field is the one tab stop, and the arrow keys step from it.

### Keyboard

| Key | Action |
|-----|--------|
| `ArrowUp` / `ArrowDown` | Step |
| `Shift + Arrow` | Step by `large-step` |
| `Alt + Arrow` | Step by `small-step` |
| `Home` / `End` | To `min` and `max` |
| `Enter` | Commits and formats the value |

### Before the elements upgrade

Write the starting number into the `<input>` yourself, server side. Zag seeds the field from `default-value` on the first render, but until the bundle runs the field shows whatever the markup says.

```html
<ui-number-input default-value="2" min="1">
  <ui-number-input-input delegate><input value="2"></ui-number-input-input>
</ui-number-input>
```

The buttons work only after upgrade. The field is a plain text input before it, which is the better failure mode: the number can still be typed and submitted.
