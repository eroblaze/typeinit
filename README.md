<h1 align="center">
Typeinit
</h1>
<p align="center">
An Intuitive JavaScript Typing Animation Library
</p>
<p align="center">
<a href="https://www.npmjs.com/package/typeinit"><img src="https://img.shields.io/npm/v/typeinit"></a>
</p>
<br>

## The problem

There are typing animation libraries available out there but most are really difficult to use. This can be frustrating when you want to get an animation up really quickly.

## This solution

Typeinit is a javascript typing animation library which is easy and intuitive to use. It is a _plug and play_ library which produces really smooth animations without headaches.

## Features

- Offers a chainable API for ease of use.
- Choose to delay the animation until the target element becomes visible on the screen.
- Define strings to type programmatically or in the HTML (a useful fallback in case the user doesn't have JavaScript enabled, as well as for SEO).
- Style the color of the caret with any CSS color syntax (gradients work too 😋).
- Responsive: the caret shrinks or grows in relation to the font size specified.
- Fire callback functions when a character is typed, deleted, or when repeating.

## Installation

#### via NPM

```
npm install typeinit
```

#### via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/typeinit@1.2.5/dist/index.umd.js"></script>
```

## Setup

#### javascript (ES6+)

After NPM installation

```javascript
import Typeinit from "typeinit";

new Typeinit(".element").type("Hello world!").play();
```

#### javascript (ES5+)

With CDN

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Typeinit</title>
  </head>
  <body>
    <div class="element"></div>
    <!-- Typeinit CDN -->
    <script src="https://cdn.jsdelivr.net/npm/typeinit@1.2.5/dist/index.umd.js"></script>
    <script>
      const typeinit = new Typeinit(".element");
      typeinit.type("Hello world!").play();
    </script>
  </body>
</html>
```

## Customization

```javascript
const typeinit = new Typeinit(".element", {
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
   * @property {string} caretWidth the width of the caret
   */
  caret: true,
  caretColor: "currentcolor",
  caretWidth: 1,

  /**
   * @property {boolean} waitUntilVisible Start the animation only when the element is within the viewport
   * @property {string} visibleOptions configure when the element becomes visible
   */
  waitUntilVisible: false,
  visibleOptions: "center bottom",

  /**
   * Before it begins typing
   */
  onStart: () => {},

  /**
   * All typing is complete
   */
  onEnd: () => {},

  /**
   * After reset
   */
  onReset: () => {},

  /**
   * After each character is typed
   */
  onCharTyped: () => {},

  /**
   * After each character is deleted
   */
  onCharDeleted: () => {},
});
```

## Contribution

Check out [CONTRIBUTING.md](./CONTRIBUTING.md) file to get started.

## License

Code released under the [MIT license](./LICENSE).
