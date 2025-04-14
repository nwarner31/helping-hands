import {render, screen} from "@testing-library/react";
import Card from "./Card";

describe("Card tests", () => {
   it("should have a header if one is provided", () => {
       const {container} = render(<Card header="I am a header" >Test content</Card>);
       const header = container.querySelector('.header');
       expect(header).toBeInTheDocument();
   });
   it("should not have a header if one is not provided", () => {
       const {container} = render(<Card>Test content</Card>);
       const header = container.querySelector('.header');
       expect(header).not.toBeInTheDocument();
   });
   it("should have the children as a direct child of the card", () => {
       const {container} = render(<Card>I am the body</Card>);
       const body = screen.getByText("I am the body");
       expect(body.parentElement).toBe(container);
   });
   it("should include the className on the card container if provided", () => {
       const contClass = "contClass";
       const {container} = render(<Card className={contClass}>Test content</Card>);
       const cardClass = container.querySelector(`.${contClass}`);
       const card = container.querySelector('.card');
       expect(card).toBe(cardClass);
   });
   it("should have the header background color of the headerBgColor if provided", () => {
       const headerBg = 'purple';
       const {container} = render(<Card header="The header" headerBgColor={headerBg} >Test content</Card>);
       const header = container.querySelector('.header');
       expect(header).toHaveStyle(`background-color: ${headerBg}`);
   });
   it("should have the header text color of the headerTextColor if provided", () => {
       const headerTextColor = 'red';
       const {container} = render(<Card header="The header" headerTextColor={headerTextColor} >Test content</Card>);
       const header = container.querySelector('.header');
       expect(header).toHaveStyle(`color: ${headerTextColor}`);
   })
});