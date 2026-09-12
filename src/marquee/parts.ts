import type * as marquee from "@zag-js/marquee";

import { numberAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { MARQUEE_CONTENT, MARQUEE_ROOT } from "./brands";
import { sideOf, type UIMarquee } from "./root";

type Props = Record<string, unknown>;

export type UIMarqueePart = ZagPart<marquee.Api, UIMarquee>;

abstract class MarqueePart extends ZagPart<marquee.Api, UIMarquee> {
  protected get ownerBrand(): symbol {
    return MARQUEE_ROOT;
  }

  protected register(owner: UIMarquee): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UIMarquee): void {
    owner.unregisterChild(this);
  }
}

/**
 * The row of contents, and the one part that creates elements.
 *
 * Zag renders `contentCount` contents: the first is the real one, the rest
 * are copies that fill the root so the loop never shows a gap. The count is
 * known only here, at render time, and it changes with the root's width, so
 * the copies cannot be authored. The first content child is the source; the
 * viewport clones its children once per extra count, and clones them again
 * when the source changes or the sizes do.
 *
 * A copy is built detached, handed to the consumer through `ui-marquee:clone`,
 * and appended afterwards. `dispatchEvent` is synchronous, so a listener that
 * strips an attribute does it before the copy is ever in the document.
 */
export class UIMarqueeViewport extends MarqueePart {
  #clones: Element[] = [];
  #source: UIMarqueeContent | undefined;
  #mutations: MutationObserver | undefined;
  #resizes: ResizeObserver | undefined;

  protected override get idKey(): string {
    return "viewport";
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.authoredId();
  }

  protected override register(owner: UIMarquee): void {
    super.register(owner);
    owner.registerViewport(this);
  }

  protected override unregister(owner: UIMarquee): void {
    owner.unregisterViewport(this);
    super.unregister(owner);
  }

  protected propsFor(api: marquee.Api): Props {
    return api.getViewportProps() as Props;
  }

  /**
   * The name of the content at `index`: the source's own, or one derived
   * from it. The source is looked up here and not only at the first stamp,
   * because the root asks for the names during the render that precedes it,
   * and Zag then looks the source up by that name when it starts.
   */
  contentName(index: number): string | undefined {
    const target = this.delegation.target();
    const source = this.#source ?? (target ? this.#findSource(target) : undefined);
    const name = source?.authoredName;

    if (!name) {
      return undefined;
    }

    return index === 0 ? name : `${name}-${index}`;
  }

  /** One copy per extra content. Called by the root after every render. */
  stamp(api: marquee.Api): void {
    const target = this.delegation.target();

    if (!target) {
      return;
    }

    const source = this.#findSource(target);

    if (!source) {
      return;
    }

    this.#observe(source);

    const count = Math.max(0, api.contentCount - 1);

    // A DOM differ that re-renders the marquee from server markup removes the
    // copies, since the server never sent them. Any gap means the numbering is
    // off, so the rest go too and the copies are built again from one.
    const kept = this.#clones.filter((clone) => clone.parentElement === target);

    if (kept.length !== this.#clones.length) {
      for (const clone of kept) {
        clone.remove();
      }

      this.#clones = [];
    }

    while (this.#clones.length > count) {
      this.#clones.pop()?.remove();
    }

    while (this.#clones.length < count) {
      const index = this.#clones.length + 1;
      const clone = this.#build(source, index);

      this.owner?.cloned({ clone, index, source });

      const previous = this.#clones[index - 2] ?? source;

      previous.after(clone);
      this.#clones.push(clone);
    }
  }

  protected override release(): void {
    super.release();
    this.#unobserve();
  }

  /** The first content child that is not one of the copies. */
  #findSource(target: Element): UIMarqueeContent | undefined {
    for (const child of target.children) {
      if ((child as unknown as Record<symbol, unknown>)[MARQUEE_CONTENT] === true && !this.#clones.includes(child)) {
        return child as UIMarqueeContent;
      }
    }

    return undefined;
  }

  /**
   * A shallow clone of the source keeps its attributes and gets the copy's
   * index; its children are cloned deep. Every `id` inside goes, because two
   * elements with one id are not HTML and Zag looks elements up by id. The
   * copy itself is named after the source when the source is named, so a
   * consumer can address it.
   */
  #build(source: UIMarqueeContent, index: number): Element {
    const clone = source.cloneNode(false) as Element;

    clone.removeAttribute("id");
    clone.setAttribute("index", String(index));

    for (const node of source.childNodes) {
      clone.append(node.cloneNode(true));
    }

    for (const named of clone.querySelectorAll("[id]")) {
      named.removeAttribute("id");
    }

    const name = this.contentName(index);

    if (name) {
      // Named before it connects, so the content captures it as authored.
      const target = clone.hasAttribute("delegate") ? clone.firstElementChild : clone;

      target?.setAttribute("id", name);
    }

    return clone;
  }

  /**
   * Two observers, both started at the first stamp rather than on connect.
   *
   * The source is watched for any change so the copies follow it. A record on
   * the source element itself is ignored: the root's own render writes its
   * props there, and `will-change` toggles on every pause.
   *
   * The sizes are watched because Zag's count is not reactive: its own
   * observer writes the new dimensions into a ref nobody subscribes to, and
   * `contentCount` is fixed into the api at connect. So the root reconnects
   * rather than re-renders. Ours is registered first, so it is dispatched
   * first and its frame is queued before the one Zag's requests to write the
   * dimensions; the reconnect waits a second frame to land after it.
   */
  #observe(source: UIMarqueeContent): void {
    if (this.#source === source) {
      return;
    }

    this.#unobserve();
    this.#source = source;

    this.#mutations = new MutationObserver((records) => {
      const changed = records.some((record) => !(record.type === "attributes" && record.target === source));

      if (changed) {
        this.#invalidate();
      }
    });
    this.#mutations.observe(source, { childList: true, subtree: true, attributes: true, characterData: true });

    this.#resizes = new ResizeObserver(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => this.owner?.refresh()));
    });
    this.#resizes.observe(source);

    if (this.owner) {
      this.#resizes.observe(this.owner);
    }
  }

  #unobserve(): void {
    this.#mutations?.disconnect();
    this.#resizes?.disconnect();
    this.#mutations = undefined;
    this.#resizes = undefined;
    this.#source = undefined;
  }

  #invalidate(): void {
    for (const clone of this.#clones.splice(0)) {
      clone.remove();
    }

    this.scheduleRender();
  }
}

/**
 * One track of items. The source is the one without `index`, or with `index`
 * 0; a copy carries the index the viewport gave it. A copy is `inert` on top
 * of Zag's `aria-hidden`, so a link inside it is not a second tab stop.
 */
export class UIMarqueeContent extends MarqueePart {
  static readonly observedAttributes = ["index"];

  get [MARQUEE_CONTENT](): true {
    return true;
  }

  get index(): number | null {
    return numberAttribute(this, "index") ?? null;
  }

  /**
   * Reflected, for the reason the tabs trigger gives for `value`: a framework
   * that renders these elements tests `key in el` before choosing between a
   * property write and `setAttribute`, and a getter-only property swallows it.
   */
  set index(next: number | null) {
    if (next == null) {
      this.removeAttribute("index");
      return;
    }

    this.setAttribute("index", String(next));
  }

  /** The id the consumer wrote, for the root's `ids.content` lookup. */
  get authoredName(): string | undefined {
    return this.authoredId();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Captured before the first render writes Zag's name over it.
    this.authoredId();
  }

  protected propsFor(api: marquee.Api): Props {
    const index = this.index ?? 0;
    const props = api.getContentProps({ index }) as Props;

    return index > 0 ? { ...props, inert: true } : props;
  }
}

export class UIMarqueeItem extends MarqueePart {
  protected propsFor(api: marquee.Api): Props {
    return api.getItemProps() as Props;
  }
}

export class UIMarqueeEdge extends MarqueePart {
  static readonly observedAttributes = ["side"];

  protected propsFor(api: marquee.Api): Props {
    return api.getEdgeProps({ side: sideOf(this.getAttribute("side")) ?? "start" }) as Props;
  }
}
