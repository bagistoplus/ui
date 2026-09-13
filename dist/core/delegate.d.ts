type Props = Record<string, unknown>;
/**
 * Where a machine's props land.
 *
 * By default an element is a container: Zag's props go on the element itself,
 * so a class written on it behaves the way anyone would expect. With
 * `delegate` they go on its single element child instead, and the element
 * costs no layout of its own.
 *
 * That is the escape hatch for everything the host cannot be. A custom element
 * cannot be a `<ul>` or an `<li>`, and only a real `<button>` brings Enter,
 * Space, focus rings and disabled pointer blocking.
 */
export declare class Delegate {
    #private;
    constructor(host: HTMLElement, onChange: () => void);
    get enabled(): boolean;
    /**
     * The delegate target is an ordinary element, so it cannot announce itself
     * the way a child custom element does. Two cases need catching: a bundle that
     * is not deferred connects the host before its child is parsed, and a morph
     * can swap the child for a different element later. Scope is the host's own
     * children, nothing deeper, so unrelated content never forces a render.
     * Measurement showed a subtree observer was the wrong shape: it never fired
     * at mount and fired on content nobody cares about.
     */
    observe(): void;
    disconnect(): void;
    apply(props: Props, scope: string): void;
    release(scope: string): void;
    /**
     * Resolved on every call rather than cached. During HTML parsing the host
     * connects before its child exists, and a morph can swap the child
     * underneath us.
     */
    target(): HTMLElement | null;
}
export {};
//# sourceMappingURL=delegate.d.ts.map