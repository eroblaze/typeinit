import Typeinit from "../index";
import { describe, test, expect, beforeEach, afterEach } from "vitest";

const addInnerText = (innerText?: string) => {
  return `<div class="div">${innerText ? innerText : ""}</div>`;
};

describe("TYPEINIT INIT", () => {
  beforeEach(() => {
    document.body.innerHTML = addInnerText();
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("A HTML ELEMENT can be used", () => {
    const div = document.querySelector(".div") as HTMLDivElement;
    const typeinit = new Typeinit(div);
    expect(typeinit).toBeDefined();
  });
  test("A css selector string can be used", () => {
    const typeinit = new Typeinit(".div");
    expect(typeinit).toBeDefined();
  });

  test("An error is raised if the element is an input or textarea", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    document.body.appendChild(input);
    document.body.appendChild(textarea);

    const inp = document.querySelector("input") as HTMLInputElement;
    const tArea = document.querySelector("textarea") as HTMLTextAreaElement;

    // For Inputs
    expect(() => new Typeinit(inp)).toThrowError("input");
    // // For TextAreas
    expect(() => new Typeinit(tArea)).toThrowError("textarea");
  });

  test("Caret is appended to the element on initialisation", () => {
    new Typeinit(".div");
    const div = document.querySelector(".div") as HTMLDivElement;
    expect(div.childElementCount).toBe(1);
  });

  test("Only one caret is appended to an element if multiple instances of Typeinit are set to that element", () => {
    new Typeinit(".div");
    new Typeinit(".div");
    const div = document.querySelector(".div") as HTMLDivElement;
    expect(div.childElementCount).toBe(1);
  });

  test("Caret is NOT appended to the element on initialisation if the user disables caret", () => {
    new Typeinit(".div", { caret: false });
    const div = document.querySelector(".div") as HTMLDivElement;
    expect(div.childElementCount).toBe(0);
  });

  test("The innerText of the element is cleared before typing", () => {
    const text = "Some texts in here";
    document.body.innerHTML = addInnerText(text);
    const div = document.querySelector(".div") as HTMLDivElement;

    expect(div.innerText).toBe(text);

    new Typeinit(".div");

    expect(div.innerText).toBeFalsy();
  });

  test("The custom style tag is added to the html head tag", () => {
    const numOfStyleTags = document.head.querySelectorAll("style").length;

    new Typeinit(".div", { caret: true });

    expect(document.head.querySelectorAll("style")).toHaveLength(
      numOfStyleTags + 1
    );
  });

  test("onStart() cb is called", () =>
    new Promise<void>((done) => {
      expect.assertions(1);
      new Typeinit(".div", {
        typingSpeed: 0,
        onStart: () => {
          done();
          expect(true).toBeTruthy();
        },
      })
        .type("test")
        .play();
    }));

  test("onStart() cb is called only once", () =>
    new Promise<void>((done) => {
      expect.assertions(1);
      new Typeinit(".div", {
        typingSpeed: 0,
        onStart: () => {
          expect(true).toBeTruthy();
        },
        onEnd: () => done(),
      })
        .type("test")
        .type("hey")
        .play();
    }));

  test("onEnd() cb is called", () =>
    new Promise<void>((done) => {
      expect.assertions(1);
      new Typeinit(".div", {
        typingSpeed: 0,
        onEnd: () => {
          done();
          expect(true).toBeTruthy();
        },
      })
        .type("test")
        .play();
    }));

  test("onCharTyped() cb is called", () =>
    new Promise<void>((done) => {
      expect.assertions(4);
      new Typeinit(".div", {
        typingSpeed: 0,
        onCharTyped: () => {
          expect(true).toBeTruthy();
        },
        onEnd: () => {
          done();
        },
      })
        .type("test")
        .play();
    }));

  test("onCharDeleted() cb is called for each character", () =>
    new Promise<void>((done) => {
      expect.assertions(4);
      new Typeinit(".div", {
        typingSpeed: 0,
        deletingSpeed: 0,
        onCharDeleted: () => {
          expect(true).toBeTruthy();
        },
        onEnd: () => {
          done();
        },
      })
        .type("test")
        .deleteAll()
        .play();
    }));

  test("onCharDeleted() cb is called for each word", () =>
    new Promise<void>((done) => {
      expect.assertions(1);
      new Typeinit(".div", {
        typingSpeed: 0,
        deletingSpeed: 0,
        onCharDeleted: () => {
          expect(true).toBeTruthy();
        },
        onEnd: () => {
          done();
        },
      })
        .type("test")
        .delete(1, { mode: "word" })
        .play();
    }));
});
