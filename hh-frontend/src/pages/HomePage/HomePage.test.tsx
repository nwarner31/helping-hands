import {render, screen} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";

import HomePage from "./HomePage";

const renderPage = () => render(<BrowserRouter><HomePage /></BrowserRouter>);
describe("Home Page tests", () => {
    it("should render the header correctly", () => {
        renderPage();
        const header = screen.getByRole("heading", {level: 1});
        expect(header).toBeInTheDocument();
        expect(header).toHaveTextContent("Welcome to the");
        expect(header).toHaveTextContent("Helping Hands");
        expect(header).toHaveTextContent("Home Health Agency");
        expect(header).toHaveTextContent("Employee Portal");
    });
    it("renders the login button", () => {
        renderPage();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    it("renders the register link inside a button", () => {
        renderPage();
        const register = screen.getByRole("link", { name: /register/i });
        expect(register).toBeInTheDocument();
        expect(register).toHaveAttribute("href", "/register");
    });
    it("renders the accordion header", () => {
        renderPage();
        const accordionHeader = screen.getByRole("button", {name: /what is this site for\?/i,});
        expect(accordionHeader).toBeInTheDocument();
    });

    it("renders the accordion content text (initially hidden depending on component)", () => {
        renderPage();
        const accordionBody = screen.getByText(/this site is for tracking/i);
        expect(accordionBody).toBeInTheDocument();
    });
})