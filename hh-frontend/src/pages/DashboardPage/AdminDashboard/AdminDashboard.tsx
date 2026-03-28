import ClientIcon from '../../../assets/ClientLogo';
import HouseIcon from "../../../assets/HouseLogo";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";
import EmployeeLogo from "../../../assets/EmployeeLogo";

const AdminDashboard = () => {
    return (
        <main >
            <LinkButton id="client" to="/view-clients" className="flex flex-col items-center text-center mb-4 w-39" variant="primary">
                <ClientIcon className="m-auto fill-current w-25 p-0" />
                <div>Manage Clients</div>
            </LinkButton>
            <LinkButton id="house" to="/view-houses" variant="primary" className="flex flex-col items-center text-center w-39 mb-4">
                <HouseIcon className="fill-current w-25 m-auto"  />
                <div>Manage Houses</div>
            </LinkButton>
            <LinkButton id="employee" to="/view-employees" variant="primary" className="flex flex-col items-center text-center w-39 !px-3">
                <EmployeeLogo className="stroke-current w-25 h-25 m-auto"  />
                <div className="text-sm">Manage Employees</div>
            </LinkButton>
        </main>
    );
}

export default AdminDashboard;