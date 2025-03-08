import React, { useState } from "react";
import {Link} from "react-router-dom";
import styles from "./Navbar.module.css"; // Import the CSS module

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>Helping Hands</div>

            <div className={`${styles.navLinks} ${isOpen ? styles.navLinksOpen : ""}`}>
                <Link to="#">Home</Link>
                <Link to="#">Services</Link>
                <Link to="#">About</Link>
                <Link to="#">Contact</Link>
            </div>

            <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
                ☰
            </button>
        </nav>
    );
};

export default Navbar;
