import React, {Fragment, useState} from 'react';
import clsx from "clsx";
import Button from "../../components/Button/Button";
import {House} from "../../models/House";
import {Link} from "react-router-dom";
import {formatDate} from "../../utility/formatting";
import {Client} from "../../models/Client";
import {Employee} from "../../models/Employee";


type Props = {
    house: House;
    isOdd: boolean;
    canEdit: boolean;
    onRemoveClient: (house: House, client: Client) => void;
    onRemoveManager: (house: House, manager: Employee) => void;
};

const ViewHouseListItem: React.FC<Props> = ({ house, isOdd, canEdit, onRemoveClient, onRemoveManager }) => {
    const [expanded, setExpanded] = useState(false);
    const buttonVariant = isOdd ? "accent" : "secondary";
    const toggleExpanded = () => setExpanded((prev) => !prev);

    const {clients = [], maxClients} = house;
    const address = [house.street1, house.street2, house.city, house.state]
        .filter(Boolean)
        .join(', ');
    const clientList = [];
    for(let index = 0; index < maxClients; index++) {
        if(index < clients.length) {
            clientList.push(
                <Fragment key={clients[index].id}>
                    <div>{clients[index].id}</div>
                    <div>{clients[index].legalName}</div>
                    <div className={clsx(canEdit && "hidden sm:block")}>{formatDate(clients[index].dateOfBirth)}</div>
                    {canEdit && <div><Button className="w-full" variant={buttonVariant} onClick={() => onRemoveClient(house, clients[index])} data-testid="client-remove-button">Remove</Button></div>}
                </Fragment>
            );
        } else {
            clientList.push(
                <Fragment key={index} >
                    <div className={clsx("text-left pl-7", canEdit ? "col-span-2 sm:col-span-3" : "col-span-3")} >Empty</div>
                    {canEdit && <div><Link to={`/house/${house.id}/add-client`} state={{house: house}} ><Button className="w-full" variant={buttonVariant} data-testid="client-add-button">Add</Button></Link></div>}
                </Fragment>
            );
        }

    }
    return (
        <div className={clsx("p-1 font-body text-center", isOdd && "bg-secondary text-white")}>

            <div className={clsx("grid grid-rows-2 gap-x-1 gap-y-0", canEdit ? "grid-cols-[65px_1fr_1fr_110px] sm:grid-cols-[65px_1fr_1fr_1fr_110px] md-lg:grid-cols-[65px_1fr_1fr_1fr_1fr_110px]" : "grid-cols-[65px_1fr_1fr_1fr_1fr]")}>
                <Button onClick={toggleExpanded} className="row-span-2" variant={buttonVariant}>
                    {expanded ? '▼' : '▶'}
                </Button>
                <div className="font-semibold">House Id</div>
                <div className="font-semibold">House Name</div>
                <div className="font-semibold hidden md-lg:block">Clients</div>
                <div className="font-semibold hidden sm:block">F Only</div>
                <div>{house.id}</div>

                <div>{house.name}</div>

                <div className="hidden md-lg:block">{clients.length}/{house.maxClients}</div>

                <div className="hidden sm:block">
                    {house.femaleEmployeeOnly ? 'Yes' : 'No'}
                </div>
                {canEdit &&
                    <div className="col-start-4 sm:col-start-5 md-lg:col-start-6 row-start-1 row-span-2">
                        <Link to={`/edit-house/${house.id}`} state={{house: house}}><Button className="h-full" variant={buttonVariant}>
                            Edit
                        </Button></Link>
                    </div>
                   }
            </div>

            {expanded && (

                <div className="flex flex-col gap-y-2 bg-slate-100 my-1 mx-3 rounded-lg py-3 px-2 text-black">
                    <div>
                        <strong>Address:</strong> {address}
                    </div>
                    <div>
                        <div className="flex items-center mb-2">
                            <strong>Primary Manager:</strong> {house.primaryHouseManager ?
                            <><div className="grow">{house.primaryHouseManager.name}</div>
                            {canEdit && <Button className="w-25" onClick={() => onRemoveManager(house, house.primaryHouseManager!)} variant={buttonVariant} >Remove</Button>}</> :
                            <><div className="grow">N/A</div>
                            {canEdit && <Link to={`/house/${house.id}/add-manager?position=primary`}><Button className="w-25" variant={buttonVariant} >Add</Button></Link>}</>}
                        </div>
                        <div className="flex items-center mb-2">
                            <strong>Secondary Manager:</strong> {house.secondaryHouseManager ?
                            <>
                                <div className="grow">{house.secondaryHouseManager.name}</div>
                                {canEdit && <Button className="w-25" onClick={() => onRemoveManager(house, house.secondaryHouseManager!)} variant={buttonVariant} >Remove</Button>}
                            </> :
                            <>
                                <div className="grow">N/A</div>
                                {canEdit && <Link to={`/house/${house.id}/add-manager?position=secondary`}><Button className="w-25" variant={buttonVariant}>Add</Button></Link>}
                        </>}
                        </div>
                        <div className="text-left sm:hidden">
                            <strong>Female Employees Only:</strong> {house.femaleEmployeeOnly ? 'Yes' : 'No'}
                        </div>
                    </div>

                    <div className={clsx("grid items-center gap-y-1", canEdit ? "grid-cols-[1fr_1fr_110px] sm:grid-cols-[1fr_1fr_1fr_110px]" : "grid-cols-3")}>
                        <div className="font-semibold">Client ID</div>
                        <div className="font-semibold">Legal Name</div>
                        <div className={clsx("font-semibold", canEdit && "hidden sm:block")}>Date of Birth</div>
                        <div className={clsx(!canEdit && "hidden")}></div>
                        {clientList}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewHouseListItem;
