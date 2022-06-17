import { fireEvent, render, screen } from "@reearth/test/utils";

import Accordion, { AccordionItemType } from "./index";

const sampleContents: AccordionItemType[] = [
  {
    id: "1",
    heading: <div>This is heading1</div>,
    content: <div>This is content1</div>,
  },
  {
    id: "2",
    heading: <div>This is heading2</div>,
    content: <div>This is content2</div>,
  },
];

test("Accordion component should be rendered", () => {
  render(<Accordion items={sampleContents} />);
});

test("Accordion component should display items header", () => {
  render(<Accordion items={sampleContents} />);
  expect(screen.getByTestId("atoms-accordion")).toBeInTheDocument();
  expect(screen.getByText(/heading1/)).toBeInTheDocument();
  expect(screen.getByText(/heading2/)).toBeInTheDocument();
});

test("Accordion component should display items content", () => {
  render(<Accordion items={sampleContents} />);
  expect(screen.getByText(/content1/)).toBeInTheDocument();
  expect(screen.getByText(/content2/)).toBeInTheDocument();
});

test("Accordion component should open when header button is clicked", () => {
  render(<Accordion items={sampleContents} />);
  expect(screen.getAllByTestId("atoms-accordion-item-content")[0]).not.toBeVisible();
  fireEvent.click(screen.getAllByTestId("atoms-accordion-item-header")[0]);
  expect(screen.getAllByTestId("atoms-accordion-item-content")[0]).toBeVisible();
});
