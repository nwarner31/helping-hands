import Card from "../../components/Card/Card";
import apiService from "../../utility/ApiService";
import {LoaderFunctionArgs, useLoaderData, useLocation, useParams} from "react-router-dom";
import {Employee} from "../../models/Employee";
import AddManagerListItem from "./AddManagerListItem";
import styles from "./AddHouseManagerPage.module.css";
import {useEffect, useState} from "react";
import {House} from "../../models/House";
import Button from "../../components/Button/Button";

export const AddHouseManagerPage = () => {
    const {managers} = useLoaderData<{managers: Employee[]}>();
    const { houseId } = useParams();
    const location = useLocation();
    const [houseData, setHouseData] = useState(location.state?.house);
    useEffect(() => {
        const fetchHouse = async () => {
            const {house} = await apiService.get<{house: House}>(`house/${houseId}`);
            setHouseData(house);
        }
        if(!houseData) {
            fetchHouse();
        }
    }, []);
    return (
        <div className={styles.container}>
            <Card className={styles.page}>
                <h1 className={styles.title}>Add House Manager</h1>
                {houseData &&
                    <table className={styles["house-table"]}>
                        <thead>
                        <tr>
                            <th>House ID</th>
                            <th>House Name</th>
                        </tr>

                        </thead>
                        <tbody>
                        <tr>
                            <td>{houseData.id}</td>
                            <td>{houseData.name}</td>
                        </tr>
                        </tbody>

                    </table>
                }

                <Button className={styles["cancel-button"]} variant="secondary" >Cancel</Button>

                {managers.map((manager, index) => <AddManagerListItem key={manager.id} employee={manager} houseId={houseId!} isOdd={index % 2 === 0} />)}
            </Card>
        </div>
    );
}

export default AddHouseManagerPage;


export const loader = async ({params}: LoaderFunctionArgs) => apiService.get(`house/${params.houseId}/available-managers`);