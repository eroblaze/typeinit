import {
  DeleteAllOptionsInterface,
  DeleteOptionsInterface,
  OptionsInterface,
  TimelineType,
  TypeinitInterface,
  WriterType,
} from "./types";

import {
  delay,
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
  #playCalled = false;
  #isRepeating = false;
  #caretClass = "typeinit__caret";
  #repeatCount = 0;
  #numOfEntry = 0;

  constructor(selector: HTMLElement | string, optionsObj?: OptionsInterface) {
    // Check the type of the selector
    if (typeof selector === "string") {
      this.#element = this._getElement(selector);
    } else {
      const tagName = selector.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") {
        throw new Error(`Selector cannot be a '${tagName}' element`);
      }
      this.#element = selector;
    }
    // Important to show spaces
    this.#element.style.whiteSpace = "pre-wrap";
    this._init();
    this._checkElementInnerText();

    optionsObj = { ...defaultOptions, ...this._confirmOptions(optionsObj) };

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
      waitUntilVisible,
      visibleOptions,
      deleteDelay,
      startDelay,
      onEnd,
      onStart,
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
      waitUntilVisible: waitUntilVisible!,
      visibleOptions: visibleOptions!,
      deleteDelay: deleteDelay!,
      startDelay: startDelay!,
      onEnd: onEnd!,
      onStart: onStart!,
    };

    // Show the caret
    if (this.#options.caret) {
      this._addStyles();
      this._createCaret();
    }
  }

  /**
   * Checks the display of the element
   * @private
   */
  private _init() {
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
  private _confirmOptions(opt?: OptionsInterface) {
    const newOptionObj: OptionsInterface = {};
    if (opt) {
      for (let option in opt) {
        const value = opt[option];
        const dValue = defaultOptions[option];

        if (typeof value !== typeof dValue) {
          // Check if this option is a callback method
          if (option === "onStart" || option === "onEnd") {
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
            console.warn(`argument should be a positive number`);
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
  private _checkElementInnerText() {
    const innerText = this.#element.innerText?.trim();
    if (innerText) {
      this.#element.innerHTML = "";
      this.type(innerText);
    }
  }

  /**
   * Get the HTML element or throw an error if the element doesn't exist
   * @param {string} selector an HTML selector string
   * @returns {Object} an HTML element
   * @private
   */
  private _getElement(selector: string) {
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
        width: 0.125em;
        height: 0.9em;
        transform: translateY(15%);
        border-radius: 3rem;
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
  private _createCaret() {
    // Check if there is already a caret in the element i.e a previous instance has typed in it, if so just return
    if (this.#element.querySelector(`.${this.#caretClass}`)) return;
    const c = createEl("span", "");
    c.classList.add(this.#caretClass);
    c.style.background = this.#options.caretColor;
    this.#element.appendChild(c);
  }

  /**
   * Adds to the timeline array
   * @param {function} func the method that was called
   * @param {*[]} message arguments passed to the called method
   * @private
   */
  private _addtimeline(func: Function, ...message: TimelineType) {
    this.#timeline.push([func, message]);
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
    if (!this.#playCalled) this._addtimeline(this._type, message);
    return this;
  }

  /**
   * Start typing
   * @param {string} message the string to type
   * @private
   */
  private async _type(message: string) {
    // put each character in a span
    for (const ch of message) {
      const chSpan = createEl("span", ch);
      this.#numOfEntry++;
      if (this.#options.caret) {
        this.#element.insertBefore(chSpan, this.#element.lastElementChild);
      } else {
        this.#element.appendChild(chSpan);
      }
      await delay(this.#options.typingSpeed);
    }
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
      this._addtimeline(this._del, numToDel, {
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
  private async _del(numToDel: number, deleteOptions?: DeleteOptionsInterface) {
    const mode = deleteOptions?.mode ?? "char";
    const speed = deleteOptions?.speed ?? this.#options.deletingSpeed;
    const deleteDelay = deleteOptions?.delay ?? this.#options.deleteDelay;

    // Don't include the caret element if caret is enabled
    const numOfChildrenToCheck = this.#options.caret ? 1 : 0;
    if (this.#element.childElementCount > numOfChildrenToCheck) {
      // Pause a bit before deleting
      await delay(deleteDelay);

      if (mode === "char") {
        for (let i = 0; i < numToDel; i++) {
          this.#numOfEntry--;
          this.#element.removeChild(
            getLastChild(this.#element, this.#options.caret)
          );
          await delay(speed);
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
                      await delay(speed);
                      break;
                    }
                    // There is a character in the previous sibling so just delete last child
                    this.#element.removeChild(lastChild);
                    await delay(speed);
                  } else {
                    // If the text content of the previous element is null, that means the element is <br>. So just delete current element and break
                    this.#element.removeChild(lastChild);
                    await delay(speed);
                    break;
                  }
                } else {
                  // This is the first character
                  this.#element.removeChild(lastChild);
                  await delay(speed);
                }
              } else {
                // Current character is a space i.e there is no character in last child so just delete it
                this.#element.removeChild(lastChild);
                await delay(speed);
              }
            } else {
              // Text content is null. This means the element is <br> so just delete it
              this.#element.removeChild(lastChild);
              await delay(speed);
            }
          }
          numToDelCount++;
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
      this._addtimeline(this._delAll, ease, { speed, delay: deleteDelay });
    return this;
  }

  /**
   * Start deleting all the characters
   * @param {boolean} [ease] how the deletion should happen
   * @param {Object} [deleteAllOptions] sets the speed and delay of the deletion
   * @private
   */
  private async _delAll(
    ease: boolean = true,
    deleteAllOptions?: DeleteAllOptionsInterface
  ) {
    const speed = deleteAllOptions?.speed ?? this.#options.deletingSpeed;
    const deleteDelay = deleteAllOptions?.delay ?? this.#options.deleteDelay;

    const numOfChildrenToCheck = this.#options.caret ? 1 : 0;

    if (this.#element.childElementCount > numOfChildrenToCheck) {
      // Pause a bit before deleting
      await delay(deleteDelay);

      if (ease === false) {
        // Remove all the characters the same time
        let numOfEntry = 0;
        while (numOfEntry < this.#numOfEntry) {
          getLastChild(this.#element, this.#options.caret).remove();
          numOfEntry++;
        }
        this.#numOfEntry = 0;
      } else {
        let numOfEntry = 0;
        while (numOfEntry < this.#numOfEntry) {
          this.#element.removeChild(
            getLastChild(this.#element, this.#options.caret)
          );
          await delay(speed);
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
    if (!this.#playCalled) this._addtimeline(this._newLine, numOfLines);
    return this;
  }

  /**
   * Start adding new lines
   * @param {number} [numOfLines=1] the number of new lines to add
   * @private
   */
  private async _newLine(numOfLines: number) {
    for (let i = 0; i < numOfLines; i++) {
      this.#numOfEntry++;

      const line = createEl("br", "");
      if (this.#options.caret) {
        this.#element.insertBefore(line, this.#element.lastElementChild);
      } else {
        this.#element.appendChild(line);
      }
      await delay(this.#options.typingSpeed);
    }
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
    if (!this.#playCalled) this._addtimeline(this._pause, ms);
    return this;
  }

  /**
   * Start pausing
   * @param {number} [ms=options.pause] the amount of time in milliseconds to pause
   * @private
   */
  private async _pause(ms: number) {
    return delay(ms);
  }

  /**
   * Begins the typing animation
   * @public
   */
  public play() {
    this._play();
  }

  /**
   * Begin animation
   * @private
   */
  private async _play() {
    // Set this.#playCalled to true to prevent multiple references of a Typeinit instance from adding to the timeline after play has been called once
    if (!this.#playCalled || this.#isRepeating) {
      this.#playCalled = true;

      if (!this.#isRepeating) {
        // This is the first time 'play()' is called because 'this.#playCalled' is false and 'this.#isRepeating' is also false
        if (this.#options.waitUntilVisible) {
          await waitUntilVisibleFunc(
            this.#element,
            this.#options.visibleOptions
          );
        }
        await delay(this.#options.startDelay);
      }

      for (const action of this.#timeline) {
        // The animation is about to start, fire onStart cb
        if (!this.#isRepeating && this.#options.onStart) {
          this.#options.onStart();
        }
        const [func, args] = [action[0], action[1]];
        await func.call(this, ...args);
      }

      if (isNumber(this.#options.repeat)) {
        if (this.#repeatCount < this.#options.repeat) {
          this.#isRepeating = true;
          if (this.#options.repeatEase) {
            await this._delAll(true, { speed: this.#options.repeatSpeed });
          } else {
            await this._delAll(false);
          }
          await delay(this.#options.repeatDelay);
          this._play();
          this.#repeatCount++;
        } else {
          this.#repeatCount = 0;
          this.#isRepeating = false;
          // Delete the timeline array
          // this.timeline = [];
        }
      } else if (this.#options.repeat === "infinite") {
        this.#isRepeating = true;

        if (this.#options.repeatEase) {
          await this._delAll(true, { speed: this.#options.repeatSpeed });
        } else {
          await this._delAll(false);
        }
        await delay(this.#options.repeatDelay);
        this._play();
      }
    }

    //  Full animation is complete, fire onEnd cb
    if (!this.#isRepeating && this.#options.onEnd) {
      this.#options.onEnd();
    }
  }
}
