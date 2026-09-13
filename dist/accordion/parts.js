import { ZagPart } from "../core/part";
import { PresenceController } from "../core/presence";
import { ACCORDION_ITEM } from "./brands";
/** The accordion's parts all hang off the item, not off the root. */
class ItemPart extends ZagPart {
    get ownerBrand() {
        return ACCORDION_ITEM;
    }
    register(owner) {
        owner.registerPart(this);
    }
    unregister(owner) {
        owner.unregisterPart(this);
    }
}
export class UIAccordionItemTrigger extends ItemPart {
    #warned = false;
    /** Named by the item's value: Zag's `ids.itemTrigger` is a function of it. */
    get idKey() {
        return this.owner?.value ? "itemTrigger" : undefined;
    }
    get idValue() {
        return this.owner?.value ?? undefined;
    }
    propsFor(api, item) {
        const value = item.value;
        return value
            ? api.getItemTriggerProps({ value, disabled: item.disabled })
            : null;
    }
    /**
     * The one part that has no usable container form. Zag's trigger props say
     * `type="button"`, `disabled` and `aria-expanded`, but Enter, Space, focus
     * rings and disabled pointer blocking come from the browser, and only a real
     * `<button>` provides them. There is no `tabindex` either, so a container
     * trigger is not even reachable.
     */
    render(api) {
        if (!this.delegation.enabled && !this.#warned) {
            this.#warned = true;
            console.warn(`[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
                `Without one it is not focusable and the keyboard cannot reach it.`);
        }
        super.render(api);
    }
}
export class UIAccordionItemIndicator extends ItemPart {
    propsFor(api, item) {
        const value = item.value;
        return value
            ? api.getItemIndicatorProps({ value, disabled: item.disabled })
            : null;
    }
}
export class UIAccordionItemContent extends ItemPart {
    #presence;
    /** Named by the item's value, like the trigger. */
    get idKey() {
        return this.owner?.value ? "itemContent" : undefined;
    }
    get idValue() {
        return this.owner?.value ?? undefined;
    }
    propsFor(api, item) {
        const value = item.value;
        return value
            ? api.getItemContentProps({ value, disabled: item.disabled })
            : null;
    }
    render(api) {
        const item = this.owner;
        if (!item) {
            return;
        }
        if (!item.presenceEnabled) {
            this.#presence?.stop();
            this.#presence = undefined;
            super.render(api);
            return;
        }
        const props = this.propsFor(api, item);
        const node = this.delegation.target();
        if (!props || !node) {
            return;
        }
        this.#presence ??= new PresenceController(() => item.scheduleRender());
        const expanded = api.getItemState({ value: item.value, disabled: item.disabled }).expanded;
        this.delegation.apply(this.#presence.decorate(node, props, expanded), this.scopeFor(item));
    }
    release() {
        this.#presence?.stop();
        this.#presence = undefined;
        super.release();
    }
}
//# sourceMappingURL=parts.js.map