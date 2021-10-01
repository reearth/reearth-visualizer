/* eslint-disable testing-library/await-async-query */
import LayerStore from "./store";

test("findById", () => {
  const root = {
    id: "",
    children: [
      {
        id: "a",
        isVisible: true,
        title: "aaaa",
        children: [{ id: "b", isVisible: true, title: "bbbb" }],
      },
    ],
  };
  const store = new LayerStore(root);

  const a = store.findById("a");
  const b = store.findById("b");
  const c = store.findById("c");
  expect(a?.id).toBe("a");
  expect(a?.title).toBe("aaaa");
  expect(b?.id).toBe("b");
  expect(b?.title).toBe("bbbb");
  expect(c).toBeUndefined();

  expect(() => {
    (a as any).pluginId = "x";
  }).toThrowError("Cannot set property");
  expect(a?.title).toBe("aaaa");
  expect(() => {
    (b as any).extensionId = "x";
  }).toThrowError("Cannot set property");
  expect(b?.title).toBe("bbbb");

  expect(b).toBe(store.findById("b"));
});

test("findByIds", () => {
  const root = {
    id: "",
    children: [
      {
        id: "a",
        isVisible: true,
        title: "aaaa",
        children: [{ id: "b", isVisible: true, title: "bbbb" }],
      },
    ],
  };
  const store = new LayerStore(root);

  const [a, c, b] = store.findByIds("a", "c", "b");
  expect(a?.id).toBe("a");
  expect(a?.title).toBe("aaaa");
  expect(b?.id).toBe("b");
  expect(b?.title).toBe("bbbb");
  expect(c).toBeUndefined();
});

test("root", () => {
  const store = new LayerStore({
    id: "",
    children: [
      {
        id: "a",
        isVisible: true,
        title: "aaaa",
      },
      { id: "b", isVisible: true, title: "bbbb" },
    ],
  });
  const root = store.root;
  expect(root.id).toBe("");
  expect(root.children?.length).toBe(2);
  expect(root.children?.[0].id).toBe("a");
  expect(root.children?.[0].title).toBe("aaaa");
  expect(root.children?.[1].id).toBe("b");
  expect(root.children?.[1].title).toBe("bbbb");

  expect(store.root).toBe(root);
});
