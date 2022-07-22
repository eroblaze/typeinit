import {
  DeleteAllOptionsInterface,
  DeleteOptionsInterface,
  OptionsInterface,
  TimelineType,
  TypeinitInterface,
  WriterType,
} from "./types";

import {
  createEl,
  getLastChild,
  waitUntilVisibleFunc,
  isNumber,
  getDefaultDisplay,
} from "./helpers";

import { defaultOptions } from "./constants";

/**
 * Welcome to Typeinit! 😍
 * @param {(Object|string)} selector HTML element OR HTML element selector
 * @param {Object} [optionsObj] options Object
 * @returns {Object} a new Typeinit Object
 */
export default class Typeinit implements TypeinitInterface {
  #element: HTMLElement;
  #options: Required<OptionsInterface>;
  #timeline: [Function, TimelineType][] = [];
  #intervalId = 0 as unknown as NodeJS.Timeout;
  #controller = new AbortController();
  #playCalled = false;
  #isRepeating = false;
  #caretClass = "typeinit__caret";
  #repeatCount = 0;
  #numOfEntry = 0;
  #resetCalled = false;

  constructor(selector: HTMLElement | string, optionsObj?: OptionsInterface) {
    // Check the type of the selector
    if (typeof selector === "string") {
      this.#element = this.#_getElement(selector);
    } else {
      const tagName = selector.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") {
        throw new Error(`Selector cannot be a '${tagName}' element`);
      }
      this.#element = selector;
    }
    // Important to show spaces
    this.#element.style.whiteSpace = "pre-wrap";
    this.#_init();
    this.#_checkElementTextContent();

    optionsObj = { ...defaultOptions, ...this.#_confirmOptions(optionsObj) };

    const {
      typingSpeed,
      deletingSpeed,
      pause,
      repeat,
      repeatEase,
      repeatSpeed,
      repeatDelay,
      caret,
      caretColor,
      caretWidth,
      waitUntilVisible,
      visibleOptions,
      deleteDelay,
      startDelay,
      onEnd,
      onStart,
      onCharTyped,
      onCharDeleted,
      onReset,
    } = optionsObj;

    this.#options = {
      typingSpeed: typingSpeed!,
      deletingSpeed: deletingSpeed!,
      pause: pause!,
      repeat: repeat!,
      repeatEase: repeatEase!,
      repeatSpeed: repeatSpeed!,
      repeatDelay: repeatDelay!,
      caret: caret!,
      caretColor: caretColor!,
      caretWidth: caretWidth!,
      waitUntilVisible: waitUntilVisible!,
      visibleOptions: visibleOptions!,
      deleteDelay: deleteDelay!,
      startDelay: startDelay!,
      onEnd: onEnd!,
      onStart: onStart!,
      onCharTyped: onCharTyped!,
      onCharDeleted: onCharDeleted!,
      onReset: onReset!,
    };

    // Show the caret
    if (this.#options.caret) {
      this._addStyles();
      this.#_createCaret();
    }
  }

  /**
   * Checks the display of the element
   * @private
   */
  #_init() {
    const display = getDefaultDisplay(this.#element);
    if (display === "inline") {
      this.#element.style.display = "inline-block";
    }
  }

  /**
   * Loops through the optionsObj and replaces any missing or invalid option with the default value
   * @param {Object} [opt] options Object
   * @returns {Object} an options Object
   * @private
   */
  #_confirmOptions(opt?: OptionsInterface) {
    const newOptionObj: OptionsInterface = {};
    if (opt) {
      for (let option in opt) {
        const value = opt[option];
        const dValue = defaultOptions[option];

        if (typeof value !== typeof dValue) {
          // Check if this option is a callback method
          if (
            option === "onStart" ||
            option === "onEnd" ||
            option === "onCharTyped" ||
            option === "onCharDeleted" ||
            option === "onReset"
          ) {
            if (typeof value === "function") {
              newOptionObj[option] = value;
            } else {
              // Not a function, use the default value which is 'undefined'
              newOptionObj[option] = dValue;
              console.warn(
                `${value} is not of type 'function' or '${typeof dValue}'`
              );
            }
          } else if (option === "repeat") {
            if (value === "infinite") newOptionObj[option] = value;
            else {
              newOptionObj[option] = dValue;
              console.warn(
                `${value} is not of type 'infinite' or '${typeof dValue}'`
              );
            }
          } else {
            // Use the default value instead
            newOptionObj[option] = dValue;
            console.warn(`${value} is not of type '${typeof dValue}'`);
          }
        }
        // Correct types
        else if (isNumber(value)) {
          // Check for negative values
          if (value >= 0) {
            newOptionObj[option] = value;
          } else {
            // All negative numbers will be changed to 0
            newOptionObj[option] = 0;
            console.warn(`${option} expects a positive number, got ${value}`);
          }
        } else {
          newOptionObj[option] = value;
        }
      }
    }
    return newOptionObj;
  }

  /**
   * Check if there is some text in the element, if so, cut it out and pass it to "type()"
   * @private
   */
  #_checkElementTextContent() {
    const textContent = this.#element.textContent?.trim();
    if (textContent) {
      this.#element.innerHTML = "";
      this.type(textContent);
    }
  }

  /**
   * Get the HTML element or throw an error if the element doesn't exist
   * @param {string} selector an HTML selector string
   * @returns {Object} an HTML element
   * @private
   */
  #_getElement(selector: string) {
    const el = document.querySelector(selector);
    if (el) {
      return el as HTMLElement;
    } else {
      throw new Error(`Couldn't find an element with '${selector}'`);
    }
  }

  /**
   * Adds the styles for the caret
   * @private
   */
  private _addStyles() {
    if (document.querySelector(`.${this.#caretClass}`)) {
      // Caret styles is already in the head tag so exit
      return;
    }

    const style = createEl("style", "");
    style.innerHTML = `
    .${this.#caretClass} {
        display: inline-block;
        height: 0.9em;
        transform: translateY(7%);
        border-radius: 100vmax;
        animation: blink-${this.#caretClass} 1s infinite;
    }

    * + .${this.#caretClass} {
        margin-inline-start: 0.25ch;
    }

    @keyframes blink-${this.#caretClass} {
        0% {
          opacity: 0;
        }
        49% {
          opacity: 0;
        }
        50% {
            opacity: 1;
        }
    }
    `;
    document.querySelector("head")!.appendChild(style);
  }

  /**
   * Creates the caret element in the given element
   * @private
   */
  #_createCaret() {
    // Check if there is already a caret in the element i.e a previous instance has typed in it, if so just return
    if (this.#element.querySelector(`.${this.#caretClass}`)) return;
    const c = createEl("span", "");
    c.classList.add(this.#caretClass);
    c.setAttribute("aria-hidden", "true");
    c.style.background = this.#options.caretColor;
    c.style.width = `${this.#options.caretWidth}px`;
    this.#element.appendChild(c);
  }

  /**
   * Removes the blinking animation from the caret element
   * @private
   */
  #_removeCaretBlinking() {
    if (this.#options.caret) {
      const caret = this.#element.querySelector(
        `.${this.#caretClass}`
      ) as HTMLElement;
      if (caret.style.animationDuration !== "0s")
        caret.style.animationDuration = "0s";
    }
  }

  /**
   * Adds the blinking animation to the caret element
   * @private
   */
  #_addCaretBlinking() {
    if (this.#options.caret) {
      const caret = this.#element.querySelector(
        `.${this.#caretClass}`
      ) as HTMLElement;
      if (caret.style.animationDuration !== "1s")
        caret.style.animationDuration = "1s";
    }
  }

  /**
   * Adds to the timeline array
   * @param {function} func the method that was called
   * @param {*[]} message arguments passed to the called method
   * @private
   */
  #_addTimeline(func: Function, ...message: TimelineType) {
    this.#timeline.push([func, message]);
  }

  /**
   * Delay execution for some time
   * @param {number} ms the time in milliseconds for the execution to be delayed
   * @returns {Promise<void>}
   * @private
   */
  #delay(ms: number) {
    return new Promise<void>((res) => {
      const intId = setTimeout(() => {
        clearInterval(intId);
        res();
      }, ms);
      this.#intervalId = intId;
    });
  }

  /**
   * Types out each character
   * @param {string} message the string to type
   * @returns {Object} a typeinit Object
   * @public
   */
  public type(message: string): WriterType {
    if (typeof message !== "string") {
      throw new Error(`'${message}' must be a string`);
    }
    if (!this.#playCalled) this.#_addTimeline(this.#_type, message);
    return this;
  }

  /**
   * Start typing
   * @param {string} message the string to type
   * @private
   */
  async #_type(message: string) {
    this.#_removeCaretBlinking();

    // put each character in a span
    for (const ch of message) {
      const chSpan = createEl("span", ch);
      this.#numOfEntry++;
      if (this.#options.caret) {
        this.#element.insertBefore(chSpan, this.#element.lastElementChild);
      } else {
        this.#element.appendChild(chSpan);
      }

      // fire onCharTyped cb
      if (this.#options.onCharTyped) {
        this.#options.onCharTyped();
      }
      await this.#delay(this.#options.typingSpeed);
    }

    this.#_addCaretBlinking();
  }

  /**
   * Deletes 1 character at a time or 1 word at a time
   * @param {number} [numToDel] the number of characters or words to be deleted
   * @param {Object} [deleteOptions] sets the mode, delay and speed of the deletion
   * @returns {Object} a typeinit Object
   * @public
   */
  public delete(numToDel: number = 1, deleteOptions?: DeleteOptionsInterface) {
    const mode = deleteOptions?.mode;
    const speed = deleteOptions?.speed;
    const deleteDelay = deleteOptions?.delay;

    if (!isNumber(numToDel)) {
      throw new Error(`'${numToDel}' must be a number`);
    }
    if (mode) {
      if (mode !== "char" && mode !== "word") {
        throw new Error("mode must be either 'word' or 'char'");
      }
    }
    if (deleteDelay) {
      if (!isNumber(deleteDelay)) {
        throw new Error(`'${deleteDelay}' must be a number`);
      }
    }

    if (!this.#playCalled)
      this.#_addTimeline(this.#_del, numToDel, {
        mode,
        speed,
        delay: deleteDelay,
      });

    return this;
  }

  /**
   * Start deleting
   * @param {number} [numToDel] the number of characters or words to be deleted
   * @param {Object} [deleteOptions] sets the mode, delay and speed of the deletion
   * @private
   */
  async #_del(numToDel: number, deleteOptions?: DeleteOptionsInterface) {
    const mode = deleteOptions?.mode ?? "char";
    const speed = deleteOptions?.speed ?? this.#options.deletingSpeed;
    const deleteDelay = deleteOptions?.delay ?? this.#options.deleteDelay;

    // Don't include the caret element if caret is enabled
    const numOfChildrenToCheck = this.#options.caret ? 1 : 0;
    if (this.#element.childElementCount > numOfChildrenToCheck) {
      // Pause a bit before deleting
      await this.#delay(deleteDelay);

      if (mode === "char") {
        for (let i = 0; i < numToDel; i++) {
          this.#numOfEntry--;
          this.#element.removeChild(
            getLastChild(this.#element, this.#options.caret)
          );

          // fire onCharDeleted cb
          if (this.#options.onCharDeleted) {
            this.#options.onCharDeleted();
          }
          await this.#delay(speed);
        }
      } else {
        // mode === "word"
        let numToDelCount = 0;
        // Run for the number of words to delete
        while (
          this.#element.childElementCount > numOfChildrenToCheck &&
          numToDelCount < numToDel
        ) {
          // Run for each word to delete
          while (this.#element.childElementCount > numOfChildrenToCheck) {
            this.#numOfEntry--;
            // Break out only when there is a space i.e an empty element before a character
            const lastChild = getLastChild(this.#element, this.#options.caret);
            const content = lastChild.textContent;
            const previousSibling = lastChild.previousElementSibling;

            if (content) {
              // Make sure the current character is not a space and there is a space before it before breaking
              if (content.trim()) {
                // This is not a space character
                if (previousSibling) {
                  // There is a previous sibling
                  const prevContent = previousSibling.textContent;
                  // If there is no content, break. Else continue
                  if (prevContent) {
                    if (!prevContent.trim()) {
                      // Yayy there is a space before our last child so delete the last child and break
                      this.#element.removeChild(lastChild);
                      await this.#delay(speed);
                      break;
                    }
                    // There is a character in the previous sibling so just delete last child
                    this.#element.removeChild(lastChild);
                    await this.#delay(speed);
                  } else {
                    // If the text content of the previous element is null, that means the element is <br>. So just delete current element and break
                    this.#element.removeChild(lastChild);
                    await this.#delay(speed);
                    break;
                  }
                } else {
                  // This is the first character
                  this.#element.removeChild(lastChild);
                  await this.#delay(speed);
                }
              } else {
                // Current character is a space i.e there is no character in last child so just delete it
                this.#element.removeChild(lastChild);
                await this.#delay(speed);
              }
            } else {
              // Text content is null. This means the element is <br> so just delete it
              this.#element.removeChild(lastChild);
              await this.#delay(speed);
            }
          }
          numToDelCount++;
          // fire onCharDeleted cb for each word deleted
          if (this.#options.onCharDeleted) {
            this.#options.onCharDeleted();
          }
        }
      }
    }
  }

  /**
   * Deletes all the characters in the element
   * @param {boolean} [ease] how the deletion should happen
   * @param {Object} [deleteAllOptions] sets the speed and delay of the deletion
   * @returns {Object} a typeinit Object
   * @public
   */
  public deleteAll(
    ease: boolean = true,
    deleteAllOptions?: DeleteAllOptionsInterface
  ) {
    const speed = deleteAllOptions?.speed;
    const deleteDelay = deleteAllOptions?.delay;

    if (speed) {
      if (!isNumber(speed)) {
        throw new Error(`'${speed}' must be a number`);
      }
    }
    if (deleteDelay) {
      if (!isNumber(deleteDelay)) {
        throw new Error(`'${deleteDelay}' must be a number`);
      }
    }

    if (!this.#playCalled)
      this.#_addTimeline(this.#_delAll, ease, { speed, delay: deleteDelay });
    return this;
  }

  /**
   * Start deleting all the characters
   * @param {boolean} [ease] how the deletion should happen
   * @param {Object} [deleteAllOptions] sets the speed and delay of the deletion
   * @private
   */
  async #_delAll(
    ease: boolean = true,
    deleteAllOptions?: DeleteAllOptionsInterface
  ) {
    const speed = deleteAllOptions?.speed ?? this.#options.deletingSpeed;
    const deleteDelay = deleteAllOptions?.delay ?? this.#options.deleteDelay;

    const numOfChildrenToCheck = this.#options.caret ? 1 : 0;

    if (this.#element.childElementCount > numOfChildrenToCheck) {
      // Pause a bit before deleting
      await this.#delay(deleteDelay);

      if (ease === false) {
        // Remove all the characters the same time
        let numOfEntry = 0;
        while (numOfEntry < this.#numOfEntry) {
          getLastChild(this.#element, this.#options.caret).remove();
          numOfEntry++;
        }
        this.#numOfEntry = 0;
        // Fire the onCharDeleted cb if reset() wasn't called
        if (!this.#resetCalled) {
          // fire onCharDeleted cb
          if (this.#options.onCharDeleted) {
            this.#options.onCharDeleted();
          }
        } else {
          this.#resetCalled = false;
        }
      } else {
        let numOfEntry = 0;
        while (numOfEntry < this.#numOfEntry) {
          this.#element.removeChild(
            getLastChild(this.#element, this.#options.caret)
          );
          // fire onCharDeleted cb
          if (this.#options.onCharDeleted) {
            this.#options.onCharDeleted();
          }
          await this.#delay(speed);
          numOfEntry++;
        }
        this.#numOfEntry = 0;
      }
    }
  }

  /**
   * Adds a new line to the element
   * @param {number} [numOfLines=1] the number of new lines to add
   * @returns {Object} a typeinit Object
   * @public
   */
  public newLine(numOfLines: number = 1) {
    if (!isNumber(numOfLines)) {
      throw new Error(`'${numOfLines}' must be a number`);
    }
    if (!this.#playCalled) this.#_addTimeline(this.#_newLine, numOfLines);
    return this;
  }

  /**
   * Start adding new lines
   * @param {number} [numOfLines=1] the number of new lines to add
   * @private
   */
  async #_newLine(numOfLines: number) {
    this.#_removeCaretBlinking();

    for (let i = 0; i < numOfLines; i++) {
      this.#numOfEntry++;

      const line = createEl("br", "");
      if (this.#options.caret) {
        this.#element.insertBefore(line, this.#element.lastElementChild);
      } else {
        this.#element.appendChild(line);
      }

      // fire onCharTyped cb
      if (this.#options.onCharTyped) {
        this.#options.onCharTyped();
      }
      await this.#delay(this.#options.typingSpeed);
    }

    this.#_addCaretBlinking();
  }

  /**
   * Pauses the animation
   * @param {number} [ms=options.pause] the amount of time in milliseconds to pause
   * @returns {Object} a typeinit Object
   * @public
   */
  public pause(ms: number = this.#options.pause) {
    if (!isNumber(ms)) {
      throw new Error(`'${ms}' must be a number`);
    }
    if (!this.#playCalled) this.#_addTimeline(this.#_pause, ms);
    return this;
  }

  /**
   * Start pausing
   * @param {number} [ms=options.pause] the amount of time in milliseconds to pause
   * @private
   */
  async #_pause(ms: number) {
    return this.#delay(ms);
  }

  /**
   * Resets the typing animation
   * @public
   */
  public reset() {
    this.#_reset();
  }

  /**
   * Clear the current timeoutId and reset all related variables
   * @private
   */
  async #_reset() {
    clearInterval(this.#intervalId);
    if (this.#options.waitUntilVisible) {
      this.#controller.abort();
      this.#controller = new AbortController();
    }
    this.#resetCalled = true;
    await this.#_delAll(false, { delay: 0 });

    // Trigger the onReset() cb if given
    if (this.#options.onReset) {
      this.#options.onReset();
    }

    this.#intervalId = 0 as unknown as NodeJS.Timeout;
    this.#playCalled = false;
    this.#isRepeating = false;
    this.#repeatCount = 0;
    this.#numOfEntry = 0;

    this.#_play();
  }

  /**
   * Begins the typing animation
   * @public
   */
  public play() {
    this.#_play();
  }

  /**
   * Begin animation
   * @private
   */
  async #_play() {
    // Set this.#playCalled to true to prevent multiple references of a Typeinit instance from adding to the timeline after play has been called once
    if (!this.#playCalled || this.#isRepeating) {
      this.#playCalled = true;

      if (!this.#isRepeating) {
        // This is the first time 'play()' is called because 'this.#playCalled' is false and 'this.#isRepeating' is also false
        if (this.#options.waitUntilVisible) {
          try {
            await waitUntilVisibleFunc(
              this.#element,
              this.#options.visibleOptions,
              this.#controller
            );
          } catch {
            // reset() was called so just return out of this function
            return;
          }
        }
        await this.#delay(this.#options.startDelay);
      }
      // The animation is about to start, fire onStart cb
      if (!this.#isRepeating && this.#options.onStart) {
        this.#options.onStart();
      }
      for (const action of this.#timeline) {
        const [func, args] = [action[0], action[1]];
        await func.call(this, ...args);
      }

      if (isNumber(this.#options.repeat)) {
        if (this.#repeatCount < this.#options.repeat) {
          this.#isRepeating = true;
          if (this.#options.repeatEase) {
            await this.#_delAll(true, { speed: this.#options.repeatSpeed });
          } else {
            await this.#_delAll(false);
          }
          await this.#delay(this.#options.repeatDelay);
          this.#_play();
          this.#repeatCount++;
        } else {
          this.#repeatCount = 0;
          this.#isRepeating = false;
        }
      } else if (this.#options.repeat === "infinite") {
        this.#isRepeating = true;

        if (this.#options.repeatEase) {
          await this.#_delAll(true, { speed: this.#options.repeatSpeed });
        } else {
          await this.#_delAll(false);
        }
        await this.#delay(this.#options.repeatDelay);
        this.#_play();
      }
      //  Full animation is complete, fire onEnd cb
      if (!this.#isRepeating && this.#options.onEnd) {
        this.#options.onEnd();
      }
    }
  }
}
