import * as marquee from "@zag-js/marquee";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, numberAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { Tiers, numberOf } from "../core/tiers";
import { MARQUEE_ROOT } from "./brands";
import type { UIMarqueeViewport } from "./parts";

/** What `ui-marquee:clone` carries. The clone is not in the document yet. */
export interface CloneDetails {
  clone: Element;
  index: number;
  source: Element;
}

const SIDES: readonly marquee.Side[] = ["start", "end", "top", "bottom"];

/** One of Zag's four sides, or `undefined` for anything else. */
export function sideOf(value: string | null | undefined): marquee.Side | undefined {
  return SIDES.find((side) => side === value);
}

/**
 * Zag's marquee measures its root and its first content, works out how many
 * copies fill the root, and expects the consumer to render that many. The
 * copies are the viewport's job here; the root only tells it when to look.
 */
export class UIMarquee extends ZagRootElement<marquee.Props, marquee.Api> {
  static readonly observedAttributes = [
    "side",
    "speed",
    "spacing",
    "delay",
    "loop-count",
    "auto-fill",
    "pause-on-interaction",
    "reverse",
    "paused",
    "default-paused",
    "dir",
    "translations-root",
  ];

  #viewport: UIMarqueeViewport | undefined;

  // The side the running machine was given, and the pause state to carry
  // over when a side change rebuilds it.
  #side: marquee.Side | undefined;
  #resumePaused: boolean | undefined;

  readonly #tiers = new Tiers(this, RESPONSIVE_ATTRIBUTES, () => this.pushProps());

  get [MARQUEE_ROOT](): true {
    return true;
  }

  protected get componentName(): string {
    return "marquee";
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#tiers.watch();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    queueMicrotask(() => {
      if (!this.isConnected) {
        this.#tiers.unwatch();
      }
    });
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    this.#tiers.watch();
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  protected createMachine(props: () => marquee.Props): VanillaMachine<any> {
    return new VanillaMachine(marquee.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): marquee.Api {
    return marquee.connect(machine.service, normalizeProps);
  }

  protected machineProps(): marquee.Props {
    const root = this.getAttribute("translations-root");

    this.#side = sideOf(this.#tiers.value("side"));

    return {
      id: this.scopeKey,
      ids: {
        root: this.authoredId(),
        ...this.authoredIds(),
        content: (index: number) => this.#viewport?.contentName(index),
      } as marquee.Props["ids"],
      dir: readDirection(this),

      side: this.#side,
      speed: numberOf(this.#tiers.value("speed")),
      spacing: this.#tiers.value("spacing"),
      delay: numberAttribute(this, "delay"),
      loopCount: numberAttribute(this, "loop-count"),
      autoFill: boolAttribute(this, "auto-fill"),
      pauseOnInteraction: boolAttribute(this, "pause-on-interaction"),
      reverse: boolAttribute(this, "reverse"),

      paused: boolAttribute(this, "paused"),
      defaultPaused: this.#resumePaused ?? boolAttribute(this, "default-paused"),

      translations: root ? { root } : undefined,

      onPauseChange: (details) => this.emit("pause-change", details),
      onLoopComplete: () => this.emit("loop-complete", {}),
      onComplete: () => this.emit("complete", {}),
    };
  }

  /**
   * A side change rebuilds the machine instead of updating it.
   *
   * Zag watches `side` and recalculates the duration, but from the dimensions
   * it last measured, which were taken along the old axis: a row's width for
   * what is now a column. Its observer re-measures once the layout has
   * flipped, into a ref that recalculates nothing, so the wrong duration
   * stays until `speed` or `spacing` change. A new machine measures at start,
   * after the render that wrote the new axis. The pause state goes with it.
   */
  protected override pushProps(): void {
    if (this.api && sideOf(this.#tiers.value("side")) !== this.#side) {
      this.#resumePaused = this.api.paused;
      this.restart();
      return;
    }

    super.pushProps();
  }

  protected override afterStart(): void {
    this.#resumePaused = undefined;
  }

  /**
   * The copies are stamped once every part has rendered, not from the
   * viewport's own render. The source is cloned with whatever attributes its
   * items carry at that moment, so a copy made before the items rendered would
   * lack their props until the next frame.
   */
  protected override afterRender(api: marquee.Api): void {
    this.#viewport?.stamp(api);
  }

  registerViewport(viewport: UIMarqueeViewport): void {
    this.#viewport = viewport;
  }

  unregisterViewport(viewport: UIMarqueeViewport): void {
    if (this.#viewport === viewport) {
      this.#viewport = undefined;
    }
  }

  /**
   * Reconnects the api to what Zag has measured. `contentCount` is computed
   * at connect, so a resize Zag observed on its own is invisible until the
   * next connect, and nothing else in Zag triggers one.
   */
  refresh(): void {
    this.pushProps();
  }

  /** Emits `ui-marquee:clone`, for the viewport, before the copy is appended. */
  cloned(details: CloneDetails): void {
    this.emit("clone", details);
  }
}

const RESPONSIVE_ATTRIBUTES = ["side", "speed", "spacing"] as const;
