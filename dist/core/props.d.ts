/**
 * Applying Zag props to a DOM node.
 *
 * This replaces `spreadProps` from `@zag-js/vanilla`, which remembers what it
 * last wrote and skips an attribute whose value has not changed. That is fine
 * until something else edits the DOM. A visual editor morph strips every
 * attribute the server did not send, which is all of them here, and the cache
 * then believes they are still in place and never writes them back. The node
 * loses its id and its data-scope, and Zag's own DOM queries stop finding it.
 *
 * So the comparison is against the live DOM. An attribute removed by anything
 * at all is restored on the next render.
 */
type Props = Record<string, unknown>;
export declare function applyProps(el: Element, props: Props, scope: string): void;
export declare function releaseProps(el: Element, scope: string): void;
export {};
//# sourceMappingURL=props.d.ts.map