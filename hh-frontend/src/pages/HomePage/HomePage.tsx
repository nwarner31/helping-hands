import React from "react";
import styles from "./HomePage.module.css";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Accordian from "../../components/Accordion/Accordion";

const HomePage: React.FC = () => {
    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <h1>
                    <span className={styles.plain}>Welcome to the</span>
                    <span className={styles.primaryColor}>Helping Hands</span>
                    <span className={styles.primaryColor}>Home Health Agency</span>
                    <span className={styles.secondaryColor}>Employee Portal</span>
                </h1>
                <div className={styles.buttonContainer}>
                    <Button variant="primary">Login</Button>
                    <Button variant="secondary">Register</Button>
                </div>
                <Accordian variant="accent" header="What is this site for?" >
                    This site is for tracking the schedules, trainings, pay for the employees if Helping Hands.
                    It is also used to track the events, and staffing needs for the clients of Helping Hand Home Health Agency.
                </Accordian>

            </Card>
        </div>
    );
};

export default HomePage;
