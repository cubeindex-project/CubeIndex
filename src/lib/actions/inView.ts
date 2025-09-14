/**
 * Svelte action that invokes callbacks when an element enters/leaves the viewport.
 *
 * Usage:
 * <div use:inView={{ once: true, onEnter: () => show = true }} />
 */
export interface InViewOptions extends IntersectionObserverInit {
  once?: boolean;
  onEnter?: (node: Element, entry: IntersectionObserverEntry) => void;
  onLeave?: (node: Element, entry: IntersectionObserverEntry) => void;
}

export function inView(node: Element, options: InViewOptions = {}) {
  let currentOptions: InViewOptions = {
    root: options.root ?? null,
    rootMargin: options.rootMargin ?? "0px",
    threshold: options.threshold ?? 0,
    once: options.once ?? false,
    onEnter: options.onEnter,
    onLeave: options.onLeave,
  };

  let observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target !== node) continue;
        if (entry.isIntersecting) {
          currentOptions.onEnter?.(node, entry);
          if (currentOptions.once) observer.unobserve(node);
        } else {
          currentOptions.onLeave?.(node, entry);
        }
      }
    },
    {
      root: currentOptions.root ?? null,
      rootMargin: currentOptions.rootMargin,
      threshold: currentOptions.threshold ?? 0,
    }
  );

  observer.observe(node);

  return {
    update(newOptions: InViewOptions = {}) {
      currentOptions = {
        root: newOptions.root ?? currentOptions.root ?? null,
        rootMargin: newOptions.rootMargin ?? currentOptions.rootMargin ?? "0px",
        threshold: newOptions.threshold ?? currentOptions.threshold ?? 0,
        once: newOptions.once ?? currentOptions.once ?? false,
        onEnter: newOptions.onEnter ?? currentOptions.onEnter,
        onLeave: newOptions.onLeave ?? currentOptions.onLeave,
      };
      observer.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.target !== node) continue;
            if (entry.isIntersecting) {
              currentOptions.onEnter?.(node, entry);
              if (currentOptions.once) observer.unobserve(node);
            } else {
              currentOptions.onLeave?.(node, entry);
            }
          }
        },
        {
          root: currentOptions.root ?? null,
          rootMargin: currentOptions.rootMargin,
          threshold: currentOptions.threshold ?? 0,
        }
      );
      observer.observe(node);
    },
    destroy() {
      observer.disconnect();
    },
  };
}
