import { VisibleOptionsType, VisibleOptionsTypeCombine } from "./types";

/**
 * Creates a new HTML element
 * @param {string} type the type of HTML element to create
 * @param {string} textContent the text to put in the new HTML element
 * @returns {Object} newly created HTML element
 * @private
 */
export function createEl(type: string, textContent: string) {
  const el = document.createElement(type);
  if (type !== "br") el.textContent = textContent;
  return el;
}

/**
 * Returns the last child of an element excluding the caret element
 * @param {Object} el the parent
 * @param {boolean} [caret=false] if true, get the second to last child
 * @returns {Object} HTML element
 * @private
 */
export function getLastChild(el: HTMLElement, caret: boolean = false) {
  const lastChild = el.querySelector(":last-child")!;
  if (!caret) {
    return lastChild;
  }
  return lastChild.previousElementSibling!;
}

/**
 * Waits until an element becomes visible
 * @param {Object} el the parent
 * @param {string} waitTill configure when the element becomes visible
 * @returns {Promise<void>}
 * @private
 */
export function waitUntilVisibleFunc(
  el: HTMLElement,
  waitTill: VisibleOptionsType | VisibleOptionsTypeCombine,
  controller: AbortController
) {
  const vPortHeight = window.innerHeight;

  return new Promise<void>((res, rej) => {
    // If reset was called when the element wasn't visible, just reject the promise
    controller.signal.addEventListener("abort", () => {
      rej();
    });

    // First check if the element is currently visible i.e if the half of the element is in the viewport
    if (el.getBoundingClientRect().top + el.offsetHeight / 2 <= vPortHeight) {
      // The center of the element is above the bottom of the viewport that means the element is visible
      res();
    } else {
      // The element is not visible i.e it is below the viewport
      // Add an event listener to the document

      const handleScroll = () => {
        const elHeight = el.offsetHeight;

        const elTop = el.getBoundingClientRect().top;
        const elCenter = elTop + elHeight / 2;
        const elBottom = elTop + elHeight;

        const pageTop = 0;
        const pageBottom = vPortHeight;
        const pageCenter = pageBottom / 2;

        const optionsToValueForElement: Record<string, number> = {
          top: elTop,
          center: elCenter,
          bottom: elBottom,
        };
        const optionsToValueForPage: Record<string, number> = {
          top: pageTop,
          center: pageCenter,
          bottom: pageBottom,
        };

        // Example waitTill: "bottom bottom"
        // Split the string by space to get the two options
        const options = waitTill.split(" ");

        let elOption, pageOption;

        if (options.length === 1) {
          // The option should be used for both
          elOption = pageOption = options[0];
        } else {
          // two options were provided for each of them
          elOption = options[0];
          pageOption = options[1];
        }

        const elementPos = optionsToValueForElement[elOption];
        const pagePos = optionsToValueForPage[pageOption];

        if (!elementPos || !pagePos) {
          document.removeEventListener("scroll", handleScroll); // Clean up
          throw new Error(
            `unknown value for visiblity options - '${waitTill}'`
          );
        }

        if (elementPos <= pagePos) {
          document.removeEventListener("scroll", handleScroll); // Clean up
          res();
        }
      };

      document.addEventListener("scroll", handleScroll);
    }
  });
}

/**
 * Gets the CSS display value of an element
 * @param {Object} el the element to get the display from
 * @returns {string} the display value of the element
 * @private
 */
export function getDefaultDisplay(el: HTMLElement) {
  const cs = window.getComputedStyle(el);
  return cs.getPropertyValue("display");
}

/**
 * Returns true if the argument is a number
 * @param {*} num value to check
 * @returns {boolean} true or false
 * @private
 */
export function isNumber(num: any): num is number {
  return typeof num === "number";
}
