import React from "react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Accordion from "../../components/Accordion/Accordion";
import {Link} from "react-router-dom";

const HomePage: React.FC = () => {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="p-4 w-full min-h-screen xs:max-w-100 xs:min-h-0 flex justify-center flex-col items-center">
                <h1 className="text-2xl font-bold font-header flex flex-col mb-3">
                    <span>Welcome to the</span>
                    <span className="text-primary">Helping Hands</span>
                    <span className="text-secondary">Home Health Agency</span>
                    <span className="text-accent">Employee Portal</span>
                </h1>
                <div className="w-full flex flex-col gap-y-2 xs:flex-row xs:gap-y-0 xs:gap-x-2 xs:flex-auto mb-4">
                    <Link to="/login" className="grow basis-1"><Button variant="primary" className="font-header font-semibold w-full py-3">Login</Button></Link>
                    <Link to="/register" className="grow basis-1"><Button variant="secondary" className="font-header w-full">Register</Button></Link>
                </div>
                <Accordion variant="accent" header="What is this site for?" className="font-header font-semibold" childrenClassName="font-body font-normal" >
                    This site is for tracking the schedules, trainings, pay for the employees if Helping Hands.
                    It is also used to track the events, and staffing needs for the clients of Helping Hand Home Health Agency.
                </Accordion>
            </Card>
        </div>
    );
};

export default HomePage;
