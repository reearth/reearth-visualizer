import { test, expect } from "vitest";

import { Provider } from "@reearth/beta/utils/use-dnd";
import { render, screen } from "@reearth/test/utils";

import Infobox from ".";

test("infobox should render blocks by renderBlock prop", async () => {
  render(
    <Provider>
      <Infobox visible blocks={[{ id: "BLOCK ID" }]} renderBlock={b => <p>{b.block?.id}</p>} />
    </Provider>,
  );

  expect(screen.getByText("BLOCK ID")).toBeVisible();
});
