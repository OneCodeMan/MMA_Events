import ShortDivider from "../ShortDivider/ShortDivider"
import { Event } from "@/Types/Event"

interface SelectedEventProps {
    event: Event,
    goToEventPage: (eventURL: string) => void,
    isSoonest: boolean,
  }

export default function SelectedEvent({ event, goToEventPage, isSoonest } : SelectedEventProps) {

    function computeDaysAwayFromDate(dateString: string) {
        const parsedEventDate = new Date(dateString);
        const today = new Date(Date.now());

        // To calculate the time difference of two dates 
        let timeAwayFromNearestEvent = parsedEventDate.getTime() - today.getTime(); 
      
        // To calculate the no. of days between two dates 
        let daysAwayFromNearestEvent: number = timeAwayFromNearestEvent / (1000 * 3600 * 24);
        let parsedDaysAway = Math.ceil(daysAwayFromNearestEvent)
        if (daysAwayFromNearestEvent <= 0) {
            return "TODAY"
        } else if (daysAwayFromNearestEvent >= 0 && daysAwayFromNearestEvent <= 1) {
            return "TOMORROW"
        } else {
            return `In ${parsedDaysAway} days`
        }
    }

    return (
        <div>
            <h1 id="event-title" className='text-3xl font-bold pt-2 text-center hover:cursor-pointer hover:text-yellow-500 sm:text-1xl' 
                onClick={() => goToEventPage(event.event_url)}>
                    {event.title}
            </h1>
            <h3 id="event-location" className='text-center italic text-sm'>{event.location}</h3>
            <h3 id="event-date" className='text-center pt-1 text-xl'>{event.date}</h3>
            {
                isSoonest ?
                <h3 id="event-days-away" className='text-center pt-1 text-xl text-blue-400'>
                   { computeDaysAwayFromDate(event.date) }
                </h3>
                : null
            }
            {/* <p className='text-center pt-2'>
                    <a href={event.event_url} className='underline decoration-pink-500'>Event Page</a>
                </p> */
            }

            <h3 id="fights-headline" className='text-center font-semibold underline py-3 text-xl'>FIGHTS</h3>

            <ul id='fights-list' className='list-none'>
                { event.fights.length > 0 ? 
                event.fights.map((fight, index) => {
                    return (
                        <li key={index} className='text-center'>
                            <div>
                            <p className='text-xl text-center'>{fight.fighter_one.name} vs. {fight.fighter_two.name}</p>
                            </div>
                            <div>
                            <p className='italic capitalize text-sm -py-4'>{fight.weight}</p>
                            </div>
                            <ShortDivider />
                        </li>
                    )
                })
                : <p className='text-center font-bold text-l py-5'>
                    No fights for this card at the moment. Stay tuned for updates!
                    </p>
                }
            </ul>
        </div>
    )
    
}