import {Event} from "../../models/Event/Event";
import Button from "../../components/Button/Button";
import {formatDate, formatTime} from "../../utility/formatting";


const ViewClientEventItem = ({event}: {event: Event}) => {
    return (
        <div className="grid grid-cols-[108px_auto_auto_auto] gap-x-1 w-full">
            <Button className="row-span-2">{event.id}</Button>
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