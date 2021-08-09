import events from "./event";

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

test("fn", () => {
  const [, emit, eventFn] = events();

  const ev1 = jest.fn();
  const ev2 = jest.fn();
  const [get, set] = eventFn("aaa");

  expect(get()).toBeUndefined();
  set(ev1);
  expect(get()).toBe(ev1);

  emit("bbb");
  expect(ev1).toBeCalledTimes(0);

  emit("aaa");
  expect(ev1).toBeCalledTimes(1);
  expect(ev1).toBeCalledWith();

  set(ev2);
  expect(get()).toBe(ev2);
  expect(ev1).toBeCalledTimes(1);
  expect(ev2).toBeCalledTimes(0);

  emit("aaa");
  expect(ev1).toBeCalledTimes(1);
  expect(ev2).toBeCalledTimes(1);

  set();
  expect(get()).toBeUndefined();

  emit("aaa");
  expect(ev1).toBeCalledTimes(1);
  expect(ev2).toBeCalledTimes(1);
});
