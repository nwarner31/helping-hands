import React, {Fragment, useState} from 'react';
import clsx from "clsx";
import Button from "../../../components/Buttons/Button/Button";
import {House} from "../../../models/House";
import {formatDate} from "../../../utility/formatting";
import {Client} from "../../../models/Client";
import {Employee} from "../../../models/Employee";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";


type Props = {
    house: House;
    canEdit: boolean;
    onRemoveClient: (house: House, client: Client) => void;
    onRemoveManager: (house: House, manager: Employee) => void;
};

const ViewHouseListItem: React.FC<Props> = ({ house, canEdit, onRemoveClient, onRemoveManager }) => {
    const [expanded, setExpanded] = useState(false);
    const buttonVariant = "primary";
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
                    <div className={clsx(canEdit ? "hidden sm-md:block" : "hidden xs:block")}>{clients[index].id}</div>
                    <div>{clients[index].legalName}</div>
                    <div className={clsx(canEdit && "hidden sm:block")}>{formatDate(clients[index].dateOfBirth)}</div>
                    {canEdit && <div><Button className="w-full" variant={buttonVariant} onClick={() => onRemoveClient(house, clients[index])} data-testid="client-remove-button">Remove</Button></div>}
                </Fragment>
            );
        } else {
            clientList.push(
                <Fragment key={`${house.id}-${index}`} >
                    <div className={clsx("text-left pl-7", canEdit ? "sm:col-span-2 sm-md:col-span-3" : "col-span-2")} >Empty</div>
                    {canEdit && <div><LinkButton to={`/house/${house.id}/add-client`} state={{house: house}} variant={buttonVariant} data-testid="client-add-button" >Add</LinkButton></div>}
                </Fragment>
            );
        }
    }
    return (
        <div className="p-1 font-body text-center py-2">

            <div className={clsx("grid grid-rows-2 gap-x-1 gap-y-0", canEdit ? "grid-cols-[65px_1fr_1fr_90px] sm:grid-cols-[65px_1fr_1fr_1fr_110px] md-lg:grid-cols-[65px_1fr_1fr_1fr_1fr_110px]" : "grid-cols-[65px_1fr_1fr_1fr] sm:grid-cols-[65px_1fr_1fr_1fr_1fr]")}>
                <Button onClick={toggleExpanded} className="row-span-2 text-sm" variant={buttonVariant}>
                    {expanded ? '▼' : '▶'}
                </Button>
                <div className="font-semibold text-xs">House Id</div>
                <div className="font-semibold text-xs">House Name</div>
                <div className={clsx("font-semibold text-xs", canEdit ? " hidden md-lg:block" : "")} >Clients</div>
                <div className="font-semibold hidden sm:block text-xs">F Only</div>
                <div className="text-sm">{house.id}</div>

                <div className="text-sm">{house.name}</div>

                <div className={clsx("text-sm", canEdit ? "hidden md-lg:block": "")} >{clients.length}/{house.maxClients}</div>

                <div className="hidden sm:block text-sm">
                    {house.femaleEmployeeOnly ? 'Yes' : 'No'}
                </div>
                {canEdit &&
                    <div className="col-start-4 sm:col-start-5 md-lg:col-start-6 row-start-1 row-span-2">
                        <LinkButton to={`/edit-house/${house.id}`} className="text-sm" variant={buttonVariant}>Edit</LinkButton>

                    </div>
                   }
            </div>

            {expanded && (

                <div className="flex flex-col gap-y-2 bg-slate-100 my-1 mx-3 rounded-lg py-3 px-2 text-black text-sm">
                    <div>
                        <strong>Address:</strong> {address}
                    </div>
                    <div>
                        {canEdit &&
                        <div className="flex items-center mb-2">
                            <div className="flex flex-col grow sm:flex-row">
                                <div className="font-semibold">Primary Manager:</div>
                                <div className="sm:grow">{house.primaryHouseManager ? house.primaryHouseManager.name : "N/A"}</div>
                            </div>
                            {house.primaryHouseManager ? <Button className="w-25" onClick={() => onRemoveManager(house, house.primaryHouseManager!)} variant={buttonVariant} data-testid="primary-remove" >Remove</Button> :
                                <LinkButton to={`/house/${house.id}/add-manager?position=primary`} className="w-25" variant={buttonVariant} data-testid="primary-add" >Add</LinkButton>}
                        </div>}
                        {!canEdit && <div className="flex">
                            <div className="font-semibold">Primary Manager:</div>
                            <div className="grow">{house.primaryHouseManager ? house.primaryHouseManager.name : "N/A"}</div>
                            </div>}
                        {canEdit &&
                        <div className="flex items-center mb-2">
                            <div className="flex flex-col grow sm:flex-row">
                                <div className="font-semibold">Secondary Manager:</div>
                                <div className="sm:grow">{house.secondaryHouseManager ? house.secondaryHouseManager.name : "N/A"}</div>
                            </div>
                            {house.secondaryHouseManager ? <Button className="w-25" onClick={() => onRemoveManager(house, house.secondaryHouseManager!)} variant={buttonVariant} data-testid="secondary-remove" >Remove</Button> :
                                <LinkButton to={`/house/${house.id}/add-manager?position=secondary`} className="w-25" variant={buttonVariant} data-testid="secondary-add">Add</LinkButton>}
                        </div>}
                        {!canEdit && <div className="flex">
                            <div className="font-semibold">Secondary Manager:</div>
                            <div className="grow">{house.secondaryHouseManager ? house.secondaryHouseManager.name : "N/A"}</div>
                        </div>}
                        <div className="text-left sm:hidden">
                            <strong>Female Employees Only:</strong> {house.femaleEmployeeOnly ? 'Yes' : 'No'}
                        </div>
                    </div>

                    <div className={clsx("grid items-center gap-y-1", canEdit ? "grid-cols-[1fr_110px] sm:grid-cols-[2fr_1fr_110px] sm-md:grid-cols-[1fr_2fr_1fr_110px]" : "grid-cols-[3fr_2fr] xs:grid-cols-[1fr_2fr_1fr]")}>
                        <div className={clsx("font-semibold", canEdit ? "hidden sm-md:block" : "hidden xs:block")}>Client ID</div>
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
