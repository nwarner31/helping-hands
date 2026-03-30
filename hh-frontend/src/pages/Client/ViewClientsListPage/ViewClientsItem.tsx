import {Client} from "../../../models/Client";
import {formatDate} from "../../../utility/formatting";
import clsx from "clsx";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";


const ViewClientsItem = ({client}: {client: Client}) => {

    return(
            <div
                className="items-center my-2 mx-1 font-body grid grid-cols-[4fr_5fr_3fr] sm:grid-cols-[3fr_5fr_3fr_1fr] md:grid-cols-[3fr_5fr_3fr_3fr_2fr] gap-x-2"
                data-testid="view-clients-item">
                <LinkButton to={`/view-client/${client.id}`} className="row-span-2 text-sm" variant="primary">
                    {client.id}
                </LinkButton>
                <div className="display-block">
                    <div className={clsx("font-semibold text-slate-700 text-xs  xs:text-sm ")}>Legal Name</div>
                    <div className="font-medium truncate text-sm xs:text-base"> {client.legalName}</div>
                </div>
                <div className="m-auto">
                    <div className={clsx("font-semibold text-slate-700 text-xs xs:text-sm")}>Date of Birth</div>
                    <div className="text-sm xs:text-base"> {formatDate(client.dateOfBirth)}</div>
                </div>
                <div className="hidden md:block text-center">
                    <div className="font-semibold " >Nickname</div>
                    <div className="text-sm">
                    {client.name ? client.name : "None"}
                </div>
                </div>
                <div className="hidden sm:block text-center">
                    <div className="font-semibold text-sm" >Sex</div>
                    <div>{client.sex}</div>

                </div>
            </div>

    );
}

export default ViewClientsItem;