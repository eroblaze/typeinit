import Typeinit from "./index";

export type VisibleOptionsType = "top" | "center" | "bottom";
export type VisibleOptionsTypeCombine =
  `${VisibleOptionsType} ${VisibleOptionsType}`;

export type DeleteType = "char" | "word";

export type WriterType = Typeinit;

export interface OptionsInterface {
  typingSpeed?: number;
  startDelay?: number;
  deletingSpeed?: number;
  deleteDelay?: number;
  pause?: number;
  repeat?: number | "infinite";
  repeatEase?: boolean;
  repeatSpeed?: number;
  repeatDelay?: number;
  caret?: boolean;
  caretColor?: string;
  waitUntilVisible?: boolean;
  visibleOptions?: VisibleOptionsType | VisibleOptionsTypeCombine;
  onStart?: () => void;
  onEnd?: () => void;

  [key: string]: any;
}

export interface DeleteOptionsInterface {
  mode?: DeleteType;
  speed?: number;
  delay?: number;
}
export interface DeleteAllOptionsInterface {
  speed?: number;
  delay?: number;
}
export type TimelineType = (
  | string
  | boolean
  | number
  | DeleteOptionsInterface
  | DeleteAllOptionsInterface
)[];

export interface TypeinitInterface {
  type: (message: string) => WriterType;
  pause: (ms?: number) => WriterType;
  newLine: (numOfLines?: number) => WriterType;
  delete: (
    numToDel: number,
    deleteOptions: DeleteOptionsInterface
  ) => WriterType;
  deleteAll: (
    ease: boolean,
    deleteAllOptions: DeleteAllOptionsInterface
  ) => WriterType;
  play: () => void;
}
