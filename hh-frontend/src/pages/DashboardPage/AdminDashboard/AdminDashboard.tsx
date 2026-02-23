import ClientIcon from '../../../assets/ClientLogo';
import HouseIcon from "../../../assets/HouseLogo";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";

const AdminDashboard = () => {
    return (
        < >
            <LinkButton id="client" to="/view-clients" className="flex flex-col items-center text-center mb-4 w-fit" variant="secondary">
                <ClientIcon className="m-auto fill-current w-25 p-0" />
                <div>Manage Clients</div>
            </LinkButton>
            <LinkButton id="house" to="/view-houses" variant="primary" className="flex flex-col items-center text-center w-fit">
                <HouseIcon className="fill-current w-25 m-auto"  />
                <div>Manage Houses</div>
            </LinkButton>
        </>
    );
}

export default AdminDashboard;