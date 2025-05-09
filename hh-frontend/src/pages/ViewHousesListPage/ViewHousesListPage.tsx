import Card from "../../components/Card/Card";
import {useAuth} from "../../context/AuthContext";
import Button from "../../components/Button/Button";
import {Link, useLoaderData} from "react-router-dom";
import apiService from "../../utility/ApiService";
import {House} from "../../models/House";
import ViewHouseListItem from "./ViewHouseListItem";
import styles from "./ViewHouseListPage.module.css";


const ViewHousesListPage = () => {
    const {employee} = useAuth();
    const canEdit = ["ADMIN", "DIRECTOR"].includes(employee?.position as string);
    const {houses} = useLoaderData() as {houses: House[], message: string};
    return (
        <div className={styles.container}>
            <Card className={styles.page}>
                <h1 className={styles.title}>Houses</h1>
                {canEdit && <div><Link to="/add-house"><Button>Add House</Button></Link></div>}
                {houses.map((house, index) => <ViewHouseListItem house={house} isOdd={index % 2 === 0} key={house.houseId} canEdit={canEdit} />)}
            </Card>
        </div>
    );
}

export default ViewHousesListPage;

export const loader = async () => apiService.get("house");