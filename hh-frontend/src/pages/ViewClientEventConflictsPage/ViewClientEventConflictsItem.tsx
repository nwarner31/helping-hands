import Button from "../../components/Buttons/Button/Button";
import {useState} from "react";
import {EventConflict} from "../../models/Event/Event";
import {formatDate, formatTime} from "../../utility/formatting";
import List from "../../components/List/List";
import ListItem from "../../components/List/ListItem";
import Card from "../../components/Cards/Card/Card";

interface ViewClientEventConflictsItemProps {
    conflict: EventConflict;
}
const ViewClientEventConflictsItem = ({conflict}: ViewClientEventConflictsItemProps) => {
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded((prev) => !prev);

    const {event, conflicts} = conflict;
    return (
        <div>
            <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 px-1 sm:grid-cols-[auto_2fr_3fr_auto]">
                <Button className="row-span-4 col-start-1" onClick={toggleExpanded}>{expanded ? '▼' : '▶'}</Button>
                <div className="row-start-1 col-start-2">{event.description}</div>
                <div className="col-start-2 row-start-2 sm:col-start-2 sm:row-start-2">{event.type}</div>
                <div className="col-start-2 row-start-3 sm:row-start-1 sm:col-start-3">Begin: {formatDate(event.beginDate)} - {formatTime(event.beginTime)}</div>
                <div className="col-start-2 row-start-4 sm:col-start-3 sm:row-start-2">End: {formatDate(event.endDate)} - {formatTime(event.endTime)}</div>
                <Button className="row-span-4 col-start-3 sm:col-start-4">Edit</Button>
            </div>
            {expanded && (
                <Card className="mx-4 my-2 border-primary border-2 p-1">
                    <List>
                        {conflicts.map((conflict, index) => (
                            <ListItem id={`${conflict.id}-${index}`} key={`${conflict.id}-${index}`}>
                                <div className="grid grid-cols-[1fr_1fr_auto] sm:grid-cols-[2fr_3fr_auto] gap-x-2">
                                    <div className="col-start-1 row-start-1">{conflict.description}</div>
                                    <div className="col-start-2 row-start-1 sm:col-start-1 sm:row-start-2">{conflict.type}</div>
                                    <div className="col-start-1 row-start-2 col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">Begin: {formatDate(conflict.beginDate)} - {formatTime(conflict.beginTime)}</div>
                                    <div className="col-start-1 row-start-3 col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-2">End: {formatDate(conflict.endDate)} - {formatTime(conflict.endTime)}</div>
                                   <Button className="row-span-3 sm:row-span-2 col-start-3 row-start-1">Edit</Button>
                                </div>
                            </ListItem>
                        ))}
                    </List>

                </Card>
            )}
        </div>
       );
}

export default ViewClientEventConflictsItem;