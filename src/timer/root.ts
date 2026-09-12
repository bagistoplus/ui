import * as timer from "@zag-js/timer";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, interpolate, numberAttribute } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { TIMER_ROOT } from "./brands";

/**
 * A timer's configuration is Zag's props, kebab-cased. Two things are settled
 * when the machine is built and no attribute changes them afterwards.
 * `auto-start` picks the initial state and nothing else, so toggling it later
 * does nothing, and `api.start()` is how a timer runs after the fact. And Zag
 * validates `start-ms`, `target-ms`, `interval` and `countdown` together at
 * build, so a combination it rejects is an error in the console, not a clamped
 * value. A changed `start-ms` does reach the running machine: Zag watches it
 * and restarts.
 */
export class UITimer extends ZagRootElement<timer.Props, timer.Api> {
  static readonly observedAttributes = [
    "countdown",
    "start-ms",
    "target-ms",
    "auto-start",
    "interval",
    "translations-area-label",
  ];

  get [TIMER_ROOT](): true {
    return true;
  }

  protected get componentName(): string {
    return "timer";
  }

  protected createMachine(props: () => timer.Props): VanillaMachine<any> {
    return new VanillaMachine(timer.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): timer.Api {
    return timer.connect(machine.service, normalizeProps);
  }

  protected machineProps(): timer.Props {
    return {
      id: this.scopeKey,
      // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
      ids: { root: this.authoredId(), ...this.authoredIds() } as timer.Props["ids"],
      countdown: boolAttribute(this, "countdown"),
      startMs: numberAttribute(this, "start-ms"),
      targetMs: numberAttribute(this, "target-ms"),
      autoStart: boolAttribute(this, "auto-start"),
      interval: numberAttribute(this, "interval"),
      translations: this.#translations(),

      onTick: (details) => this.emit("tick", details),
      onComplete: () => this.emit("complete", {}),
    };
  }

  /**
   * The placeholders take the raw numbers of `time`, not the padded strings:
   * the label is read aloud, and "5 hours" is what a person says.
   */
  #translations(): timer.IntlTranslations | undefined {
    const areaLabel = this.getAttribute("translations-area-label");

    if (!areaLabel) {
      return undefined;
    }

    return { areaLabel: (time) => interpolate(areaLabel, { ...time }) };
  }
}
