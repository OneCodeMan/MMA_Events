'use client'

import axios from 'axios'
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import FightDetails from './components/FightDetails';

export type Fighter = {
  name: string;
  record: string;
}

export type Fight = {
  fighter_one: Fighter;
  fighter_two: Fighter;
  weight: string
}

export type Event = {
  organization: string;
  title: string;
  date: string;
  event_url: string;
  fights: Fight[];
}

function parseDate(dateString: string) {
  const parsedDate = new Date(dateString);
  return parsedDate
}

export default function Home() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [selectedEventIndex, setSelectedEventIndex] = useState(0)
  const [ufcOnly, setUfcOnly] = useState(false)

  function nextEvent() {
    console.log("nextEvent called")
    let newSelectedEvent = (selectedEventIndex + 1) < events.length ? (selectedEventIndex + 1) : selectedEventIndex
    setSelectedEventIndex(newSelectedEvent)
  }

  function previousEvent() {
    console.log("previousEvent called")
    let newSelectedEvent = (selectedEventIndex - 1) >= 0 ? (selectedEventIndex - 1) : selectedEventIndex
    setSelectedEventIndex(newSelectedEvent)
  }

  function setEvent(index) {
    console.log(`setEvent called  ${index}`)
    if (index !== selectedEventIndex) {
      setSelectedEventIndex(index)
    }
  }

  const toggleUFCOnly = () => {
    setUfcOnly(!ufcOnly)

    if (ufcOnly) {
      let filteredEvents = events.filter(event => event.organization.includes("UFC"))
      setFilteredEvents(filteredEvents)
    } else {
      setFilteredEvents(events)
    }

    setSelectedEventIndex(0)
    
  }

  useEffect(() => {
    const url = 'https://floating-sierra-91917-e404c4f79857.herokuapp.com/events'
    axios.get(url).then((response) => {
      console.log(response)
      var eventsList = response.data

      const sortedEventsListByMostRecent = sortBy(eventsList, (event) => parseDate(event.date))
  
      // Make sure we only display dates in the future.
      const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1))
      const filteredSortedEventsOnlyFutureDates = sortedEventsListByMostRecent.filter((event) => parseDate(event.date) > yesterdayDate)

      setEvents(filteredSortedEventsOnlyFutureDates)

      console.log(`useEffect -- ufcOnly: ${ufcOnly}`)

      setFilteredEvents(filteredSortedEventsOnlyFutureDates)
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div>
        <div className='current-event max-w-2xl'>
          {filteredEvents.map((event, index) => {
            if (index === selectedEventIndex) {
              return (
                <div key={index}>

                  <div id="button-wrapper" className='flow-root px-5 w-full'>
                    <button 
                      className='float-left rounded-full disabled:text-gray-600' 
                      disabled={!(selectedEventIndex > 0)} 
                      onClick={previousEvent}>
                        <p className='underline font-semibold'>
                          {selectedEventIndex > 0 ? filteredEvents[selectedEventIndex - 1].title.slice(0,15) : null}{!(selectedEventIndex > 0) ? "" : "..."} &lt;&lt; Previous
                        </p>
                    </button>

                    <button 
                      className='float-right rounded-full disabled:text-gray-600'
                      disabled={(selectedEventIndex === filteredEvents.length - 1)} 
                      onClick={nextEvent}>
                        <p className='underline font-semibold'>
                          Next &gt;&gt; {selectedEventIndex === filteredEvents.length - 1 ? null : filteredEvents[selectedEventIndex + 1].title.slice(0,15)} {(selectedEventIndex === filteredEvents.length - 1) ? "" : "..."}
                        </p>
                    </button>
                  </div>

                  <div id="fight-container" className='text-center'>

                    <div id='toggle-ufc'>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={ufcOnly} onClick={toggleUFCOnly} onChange={e => {}} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                        <span className="ml-3 text-sm font-medium dark:text-gray-300">UFC only</span>
                      </label>
                    </div>

                    <h1 id="event-title" className='text-3xl font-bold pt-2 text-center sm:text-1xl'>{event.title}</h1>
                    <h3 id="event-date" className='text-center pt-2 text-xl'>{event.date}</h3>
                    <h3 id="event-location" className='text-center italic pt-2'>{event.location}</h3>
                    <p className='text-center pt-2'>
                      <a href={event.event_url} className='underline decoration-pink-500'>Event Page</a>
                    </p>
                    <ul id='fights-list' className='list-none'>
                      { event.fights.length > 0 ? 
                        event.fights.map((fight, index) => {
                          return (
                              <li key={index} className='py-2 text-xl'>{fight.fighter_one.name} vs. {fight.fighter_two.name} ({fight.weight})</li>
                          )
                        })
                        : <p className='text-center font-bold text-l pt-5'>
                            No fights for this card at the moment. Stay tuned for updates!
                          </p>
                      }
                    </ul>
                  </div>
                </div>
              )
            } else {
              return null;
            }

          })}
        </div>

        <hr className='my-6 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:opacity-100' />
        
        <div id="all-events" className='text-center'>
          <h2 className='text-center font-bold text-2xl pb-2'>More Events</h2>
          {filteredEvents 
          ? filteredEvents.map((event, index) => {
            return (
              <div key={index}> 
                <p className={index === selectedEventIndex ? 'py-1 font-bold text-blue-600 underline hover:cursor-pointer' : 'py-1 font-semibold hover:cursor-pointer'} onClick={() => setEvent(index)}>
                  {index === selectedEventIndex ? ">>" : ""}{event.title} - {event.date}
                </p>
              </div>
            )
          })
          : <p>There are currently no upcoming events. This is weird!</p>}
        </div>
        
      </div>
    </main>
  )
}
