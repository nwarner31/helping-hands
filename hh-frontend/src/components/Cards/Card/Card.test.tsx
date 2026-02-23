import {render, screen} from "@testing-library/react";
import Card from "./Card";

describe("Card tests", () => {
   it("should have a header if one is provided", () => {
       render(<Card header="I am a header" >Test content</Card>);
       const header = screen.getByTestId("card-header");
       expect(header).toBeInTheDocument();
   });
   it("should not have a header if one is not provided", () => {
       render(<Card>Test content</Card>);
       const header = screen.queryByTestId("card-header");
       expect(header).not.toBeInTheDocument();
   });
   it("should have the children as a direct child of the card", () => {
       const {container} = render(<Card>I am the body</Card>);
       const body = screen.getByText("I am the body");
       expect(body.parentElement).toBe(container);
   });
   it("should include the className on the card container if provided", () => {
       const contClass = "contClass";
       render(<Card className={contClass}>Test content</Card>);
       const card = screen.queryByTestId("card-container");
       expect(card).toHaveClass(contClass);
   });
   it("should have the header variant  if provided", () => {
       render(<Card header="The header" headerVariant="secondary" >Test content</Card>);
       const header = screen.queryByTestId("card-header");
       expect(header).toHaveClass("bg-secondary");
   });

});