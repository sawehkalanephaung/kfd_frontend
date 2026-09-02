/**
 * Quill clipboard matcher that drops the `background` attribute from pasted
 * content. Word, Google Docs and most web pages carry a `background-color`
 * through the paste, which Quill faithfully preserves as a highlight — it then
 * renders as a light block behind the text on the public page and disappears
 * against the dark editor surface in dark mode.
 *
 * Only paste is affected, so the background-colour tool still works in the
 * editors that offer it.
 */

/** `Node.ELEMENT_NODE`, written as its literal value because these modules are
 *  built during SSR, where the DOM `Node` global does not exist. */
const ELEMENT_NODE = 1;

interface QuillDelta {
  ops?: { attributes?: Record<string, unknown> }[];
}

/** Merges the strip-highlight clipboard matcher into a Quill modules object. */
export function withoutPasteHighlights<T extends Record<string, unknown>>(modules: T) {
  return {
    ...modules,
    clipboard: {
      matchers: [
        [
          ELEMENT_NODE,
          (_node: unknown, delta: QuillDelta) => {
            delta.ops?.forEach((op) => {
              if (op.attributes) delete op.attributes.background;
            });
            return delta;
          },
        ],
      ],
    },
  };
}
