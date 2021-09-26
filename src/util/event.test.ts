import events, { mergeEvents } from "./event";

test("works", () => {
  const [{ on, off }, emit] = events();

  const ev1 = jest.fn();
  const ev2 = jest.fn();
  on("aaa", ev1);
  on("aaa", ev2);

  emit("bbb");
  expect(ev1).toBeCalledTimes(0);
  expect(ev2).toBeCalledTimes(0);

  emit("aaa", 1, { test: true });
  expect(ev1).toBeCalledTimes(1);
  expect(ev1).toBeCalledWith(1, { test: true });
  expect(ev2).toBeCalledTimes(1);
  expect(ev2).toBeCalledWith(1, { test: true });

  off("aaa", ev1);
  emit("aaa", 1, { test: true });
  expect(ev1).toBeCalledTimes(1);
  expect(ev2).toBeCalledTimes(2);
});

test("once", () => {
  const [{ once }, emit] = events();

  const ev1 = jest.fn();
  once("aaa", ev1);

  emit("bbb");
  expect(ev1).toBeCalledTimes(0);

  emit("aaa");
  expect(ev1).toBeCalledTimes(1);
  expect(ev1).toBeCalledWith();

  emit("aaa");
  expect(ev1).toBeCalledTimes(1);
});

test("mergeEvents", () => {
  const cb = jest.fn();
  const [ev1, emit1] = events<{ a: [number]; c: [] }>();
  const [ev2, emit2] = events<{ a: [number]; b: [] }>();
  ev2.on("a", cb);
  const off = mergeEvents(ev1, emit2, ["a"]);

  emit1("a", 100);
  expect(cb).toBeCalledTimes(1);
  expect(cb).toBeCalledWith(100);

  off();

  emit1("a", 100);
  expect(cb).toBeCalledTimes(1);
});
