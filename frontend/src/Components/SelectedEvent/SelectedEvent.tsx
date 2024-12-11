import ShortDivider from "../ShortDivider/ShortDivider";
import { Event } from "@/Types/Event";
import { formatDistanceToNow } from 'date-fns';

interface SelectedEventProps {
    event: Event,
    goToEventPage: (eventURL: string) => void,
    isSoonest: boolean,
}

export default function SelectedEvent({ event, goToEventPage, isSoonest }: SelectedEventProps) {

    function computeDaysAwayFromDate(dateString: string) {
        const parsedEventDate = new Date(dateString);
        const now = new Date();

        if (parsedEventDate.toDateString() === now.toDateString()) {
            return "TODAY";
        } else if (parsedEventDate.getTime() - now.getTime() < 86400000) { // less than 1 day
            return "TOMORROW";
        } else {
            return `In ${Math.ceil((parsedEventDate.getTime() - now.getTime()) / (1000 * 3600 * 24))} days`;
        }
    }

    return (
        <div>
            <h1 
                id="event-title" 
                className='text-3xl font-bold pt-2 text-center hover:cursor-pointer hover:text-yellow-500 sm:text-1xl' 
                onClick={() => goToEventPage(event.event_url)} 
                role="button" 
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && goToEventPage(event.event_url)}
            >
                {event.title}
            </h1>
            <h3 id="event-location" className='text-center italic text-sm'>{event.location}</h3>
            <h3 id="event-date" className='text-center pt-1 text-xl'>{event.date}</h3>
            {isSoonest && (
                <h3 id="event-days-away" className='text-center pt-1 text-xl text-blue-400'>
                   {computeDaysAwayFromDate(event.date)}
                </h3>
            )}

            <h3 id="fights-headline" className='text-center font-semibold underline py-3 text-xl'>FIGHTS</h3>

            <ul id='fights-list' className='list-none'>
                {event.fights.length > 0 ? 
                    event.fights.map((fight, index) => (
                        <li key={index} className='text-center'>
                            <p className='text-xl'>{fight.fighter_one.name} vs. {fight.fighter_two.name}</p>
                            <p className='italic capitalize text-sm -py-4'>{fight.weight}</p>
                            <ShortDivider />
                        </li>
                    ))
                    : <p className='text-center font-bold text-l py-5'>
                        No fights for this card at the moment. Stay tuned for updates!
                      </p>
                }
            </ul>
        </div>
    );
}
