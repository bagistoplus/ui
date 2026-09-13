type Props = Record<string, unknown>;
/**
 * Keeps an element mounted through its exit animation.
 *
 * Zag applies `hidden` the moment a part closes, which is correct for the
 * accessibility tree and the tab order but leaves no time to animate. Presence
 * holds the element unhidden until `animationend`, then lets `hidden` land.
 *
 * It keys on `animation-name`, never on transitions: a transition leaves
 * `animation-name` at `none`, so Zag unmounts on the next frame.
 *
 * The contract is to DECORATE props, not to suppress them. Zag's `hidden` is
 * replaced with a deferred one, never dropped, or a closed part would stay in
 * the tab order forever. And only the hiding is deferred: a part that has just
 * been asked to show is unhidden on this very render, because Zag's own effects
 * read the DOM one frame after opening and must find it visible.
 */
export declare class PresenceController {
    #private;
    private readonly onChange;
    constructor(onChange: () => void);
    /** Whether the node still has to be shown, an exit animation included. */
    get present(): boolean;
    /**
     * Applies the deferred `hidden` on top of whatever Zag returned.
     *
     * The node is a parameter, not a constructor field: with `delegate` the
     * animated element is the part's child, and a morph can swap it.
     */
    decorate(node: HTMLElement, props: Props, present: boolean): Props;
    stop(): void;
}
export {};
//# sourceMappingURL=presence.d.ts.map