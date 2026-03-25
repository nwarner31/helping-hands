import {Event} from "../../../models/Event/Event";
import {formatShortDate, formatTime} from "../../../utility/formatting";
import clsx from "clsx";
import LinkButton from "../../../components/Buttons/LinkButton/LinkButton";

const ViewClientUpcomingEvent = ({event, isOdd}: {event: Event, isOdd: boolean}) => {
    const bodyClass = clsx("grid grid-rows-3 grid-cols-[auto_1fr_1fr_1fr] gap-x-2 mt-1 font-body rounded-md p-1",
        isOdd ? "bg-primary text-white" : "bg-white");
    const buttonClass = clsx("row-span-3 font-header !px-2")
    return (
        <div className={bodyClass}>
            <LinkButton to={`/event/${event.id}`} state={{event: event}} className={buttonClass} variant={isOdd? "accent" : "secondary"}>{event.id}</LinkButton>
            <div>Begin</div>
            <div>End</div>
            <div>Type</div>
            <div className="font-light">{formatShortDate(event.beginDate)}</div>
            <div className="font-light">{formatShortDate(event.endDate)}</div>
            <div className="font-light">{event.type}</div>
            <div className="font-light">{formatTime(event.beginTime)}</div>
            <div className="font-light">{formatTime(event.endTime)}</div>
            <div >Staff: <span className="font-light">{event.numberStaffRequired}</span></div>
        </div>
    );
}

export default ViewClientUpcomingEvent;