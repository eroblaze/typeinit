import Typeinit from "../index";
import { describe, test, expect, beforeEach, afterEach } from "vitest";

const addInnerText = (innerText?: string) => {
  return `<div class="div">${innerText ? innerText : ""}</div>`;
};

describe("TYPEINIT INSTANTIATION", () => {
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
});

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
          done(); // This should be called first before assertions inorder to avoid timeouts
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
});
