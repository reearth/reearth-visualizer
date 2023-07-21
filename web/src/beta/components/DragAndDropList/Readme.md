TODO Delete this file

drag and drop

- onDrop
  - どのアイテムが
  - どこに移動したか

を知る必要がある

一方でローカルではリアルタイム反映のためのリストが必要になる。
リアルタイム反映のためのリスト、はArrayである必要がある。

理想的には

```tsx
<DragAndDropList onDrop={(item, target) => {}}>
  {[].map(() => (
    <Container>
      <div>anycontents</div>
    </Container>
  ))}
</DragAndDropList>
```

```tsx
<DragAndDropList
  onDrop={(item, target) => {
  }}
  items={[]}
  renderItem={({ item }) => <Component {...item} />}
/>
```

ただItemsを渡してしまう場合には中身の描画ができない。


- 要素範囲外でドロップした場合にドロップの判定ができない
- 