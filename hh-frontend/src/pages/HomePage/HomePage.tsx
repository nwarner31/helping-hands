import React from "react";
import Accordion from "../../components/Accordion/Accordion";
import LinkButton from "../../components/Buttons/LinkButton/LinkButton";
import PageCard from "../../components/Cards/PageCard/PageCard";

const HomePage: React.FC = () => {

    return (
        <div className="flex justify-center items-center min-h-screen">
            <PageCard size="xs" className="p-3 items-center">
                <h1 className="text-2xl font-bold font-header flex flex-col mb-3">
                    <span>Welcome to the</span>
                    <span className="text-primary">Helping Hands</span>
                    <span className="text-secondary">Home Health Agency</span>
                    <span className="text-accent">Employee Portal</span>
                </h1>
                <div className="w-full flex flex-col gap-y-2 xs:flex-row xs:gap-y-0 xs:gap-x-2 xs:flex-auto mb-4">
                    <LinkButton to="/login" className="grow basis-1 py-3">Login</LinkButton>
                    <LinkButton to="/register" className="grow basis-1" variant="secondary" >Register</LinkButton>
                </div>
                <Accordion id="site-for" variant="accent" header="What is this site for?" className="w-full" >
                    This site is for tracking the schedules, trainings, pay for the employees of Helping Hands.
                    It is also used to track the events, and staffing needs for the clients of Helping Hand Home Health Agency.
                </Accordion>
            </PageCard>
        </div>
    );
};

export default HomePage;
