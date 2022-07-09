import Typeinit from "../index";
import { describe, test, expect, beforeEach, afterEach } from "vitest";

const addInnerText = (innerText?: string) => {
  return `<div class="div">${innerText ? innerText : ""}</div>`;
};

describe("TYPEINIT API METHODS", () => {
  beforeEach(() => {
    document.body.innerHTML = addInnerText();
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("type()", () =>
    new Promise<void>((done) => {
      const typeinit = new Typeinit(".div", {
        caret: false,
        typingSpeed: 0,
        onEnd: () => {
          // This should be called first before assertions inorder to avoid timeouts
          done();
          expect(document.querySelector(".div")?.childElementCount).toBe(4);
        },
      });

      typeinit.type("test").play();
    }));

  test("delete() with mode: 'char'", () =>
    new Promise<void>((done) => {
      // First of all type 4 characters, then delete 2
      const typeinit = new Typeinit(".div", {
        caret: false,
        deletingSpeed: 0,
        onEnd: () => {
          done();
          expect(document.querySelector(".div")?.childElementCount).toBe(2);
        },
      });

      typeinit.type("test").delete(2, { mode: "char" }).play();
    }));

  test("delete() with mode: 'word'", () =>
    new Promise<void>((done) => {
      // First of all type 4 words, then delete 3
      const typeinit = new Typeinit(".div", {
        caret: false,
        deletingSpeed: 0,
        onEnd: () => {
          done();
          // childElementCount should be 5 i.e -> f,a,s,t + space
          expect(document.querySelector(".div")?.childElementCount).toBe(5);
        },
      });

      typeinit.type("fast in and out").delete(3, { mode: "word" }).play();
    }));

  test("newLine() without an argument defaults to 1 new line", () =>
    new Promise<void>((done) => {
      // Inserts a single <br /> element
      const typeinit = new Typeinit(".div", {
        caret: false,
        typingSpeed: 0,
        onEnd: () => {
          const div = document.querySelector(".div") as HTMLDivElement;
          const onlyChild = div.querySelector("*:only-child")?.tagName;

          done();
          expect(div.childElementCount).toBe(1);
          expect(onlyChild).toBe("BR");
        },
      });

      typeinit.newLine().play();
    }));

  test("newLine() with an argument", () =>
    new Promise<void>((done) => {
      // Inserts 2 <br /> element
      const typeinit = new Typeinit(".div", {
        caret: false,
        typingSpeed: 0,
        onEnd: () => {
          const div = document.querySelector(".div") as HTMLDivElement;
          const firstChild = div.querySelector("*:first-child")?.tagName;
          const lastChild = div.querySelector("*:last-child")?.tagName;

          done();
          expect(div.childElementCount).toBe(2);
          expect(firstChild).toBe("BR");
          expect(lastChild).toBe("BR");
        },
      });

      typeinit.newLine(2).play();
    }));

  test("deleteAll()", () =>
    new Promise<void>((done) => {
      // element shouldn't have any element left in it
      const typeinit = new Typeinit(".div", {
        caret: false,
        onEnd: () => {
          done();
          expect(document.querySelector(".div")?.childElementCount).toBe(0);
        },
      });

      typeinit.type("test").deleteAll(false).play(); // I'm removing 'ease' here to make the test a bit faster
    }));

  test("Any other method called after calling play() does nothing", () =>
    new Promise<void>((done) => {
      const typeinit = new Typeinit(".div", {
        caret: false,
        onEnd: () => {
          done();
          expect(document.querySelector(".div")?.childElementCount).toBe(0);
        },
      });

      typeinit.type("test").deleteAll(false).play();
      const anotherTypeinitInstance = typeinit;
      anotherTypeinitInstance.type("another").play();
    }));

  test("reset()", () =>
    new Promise<void>((done) => {
      expect.assertions(8);
      let count = 0;

      const typeinit = new Typeinit(".div", {
        typingSpeed: 0,
        deletingSpeed: 0,
        onCharTyped: () => {
          expect(true).toBeTruthy();
        },
        onEnd: () => {
          if (count < 1) {
            typeinit.reset();
            count++;
          } else done();
        },
      });
      typeinit.type("test").play();
    }));
});
