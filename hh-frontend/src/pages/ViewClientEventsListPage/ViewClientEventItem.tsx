import {Event} from "../../models/Event/Event";
import {formatDate, formatTime} from "../../utility/formatting";
import LinkButton from "../../components/Buttons/LinkButton/LinkButton";


const ViewClientEventItem = ({event}: {event: Event}) => {
    return (

        <div className="grid grid-cols-[108px_auto_auto_auto] gap-x-1 w-full">
            <LinkButton to={`/event/${event.id}`} className="row-span-2" >{event.id}</LinkButton>
            <div className="font-semibold">
                <div className="block xs:hidden">B</div>
                <div className="hidden xs:block">Begin</div>
            </div>
            <div>{formatDate(event.beginDate)} - {formatTime(event.beginTime)}</div>
            <div className="font-semibold text-center">Type</div>
            <div className="font-semibold">
                <div className="block xs:hidden">E</div>
                <div className="hidden xs:block">End</div>
            </div>
            <div>{formatDate(event.endDate)} - {formatTime(event.endTime)}</div>
            <div className="text-center">{event.type}</div>
        </div>
    );
}

export default ViewClientEventItem;