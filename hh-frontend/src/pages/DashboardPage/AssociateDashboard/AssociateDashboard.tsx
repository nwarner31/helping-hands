import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";
import ClientIcon from "../../../assets/ClientLogo";
import HouseIcon from "../../../assets/HouseLogo";


const AssociateDashboard = () => {
    return (
        <main >
            <LinkButton id="client" to="/view-clients" className="flex flex-col items-center text-center mb-4 w-39" variant="primary">
                <ClientIcon className="m-auto fill-current w-25 p-0" />
                <div>View Clients</div>
            </LinkButton>
            <LinkButton id="house" to="/view-houses" variant="primary" className="flex flex-col items-center text-center w-39 mb-4">
                <HouseIcon className="fill-current w-25 m-auto"  />
                <div>View Houses</div>
            </LinkButton>
        </main>
    );
}


export default AssociateDashboard;