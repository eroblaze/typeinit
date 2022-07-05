import { OptionsInterface } from "./types";

/**
 * Defaults & options
 * @returns {Object} Typeinit defaults & options
 * @public
 */
export const defaultOptions: OptionsInterface = {
  /**
   * @property {number} startDelay time before typing starts in milliseconds
   */
  startDelay: 0,

  /**
   * @property {number} typingSpeed typing speed in milliseconds
   */
  typingSpeed: 100,

  /**
   * @property {number} deletingSpeed deleting speed in milliseconds
   */
  deletingSpeed: 40,

  /**
   * @property {number} deleteDelay time before deleting in milliseconds
   */
  deleteDelay: 300,

  /**
   * @property {number} pause the amount of time in milliseconds to pause
   */
  pause: 1000,

  /**
   * @property {(number|"infinite")} repeat repeat animation
   * @property {boolean} repeatEase apply an effect before repeating
   * @property {number} repeatSpeed the speed in milliseconds it takes to delete all characters in the element before repeating
   * @property {number} repeatDelay time before each repeat in milliseconds
   */
  repeat: 0,
  repeatEase: false,
  repeatSpeed: 0,
  repeatDelay: 750,

  /**
   * @property {boolean} caret show caret
   * @property {string} caretStyle color applied to the caret element
   */
  caret: true,
  caretColor: "currentcolor",

  /**
   * @property {boolean} waitUntilVisible Start the animation only when the element is within the viewport
   * @property {string} visibleOptions configure when the element becomes visible
   */
  waitUntilVisible: false,
  visibleOptions: "center bottom",

  /**
   * @property {function} onStart function to call before it begins typing
   */
  onStart: undefined,

  /**
   * @property {function} onEnd function to call when all typing is complete
   */
  onEnd: undefined,

  /**
   * @property {function} onCharTyped function to call on each character typed
   */
  onCharTyped: undefined,

  /**
   * @property {function} onCharDeleted function to call on each character or word deleted
   */
  onCharDeleted: undefined,
};
