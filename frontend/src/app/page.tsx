'use client'

import axios from 'axios'
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import FightDetails from './components/FightDetails';

import Link from 'next/Link';

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
  const [selectedEventIndex, setSelectedEventIndex] = useState(0)

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
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div>

        <div className="current-event">
          {events.map((event, index) => {
            if (index === selectedEventIndex) {
              return (
                <div key={index}>

                  <div id="button-wrapper" className='flow-root px-5'>
                    <button className='float-left rounded-full' onClick={previousEvent}>Previous</button>
                    <button className='float-right rounded-full' onClick={nextEvent}>Next</button>
                  </div>

                  <h1 id="event-title" className='text-3xl font-bold pt-2 text-center sm:text-1xl'>{event.title}</h1>
                  <h3 id="event-date" className='text-center pt-2 text-xl'>{event.date}</h3>
                  <h3 id="event-location" className='text-center italic pt-2'>{event.location}</h3>
                  <p className='text-center pt-2'>
                    <a href={event.event_url} className='underline decoration-pink-500'>More info</a>
                  </p>
                  <div id="fight-container" className='text-center'>
                    <ul id='fights-list' className='list-none'>
                      { event.fights ? 
                        event.fights.map((fight, index) => {
                          return (
                              <li key={index} className='py-2 text-xl'>{fight.fighter_one.name} vs. {fight.fighter_two.name} ({fight.weight})</li>
                          )
                        })
                        : null
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

        <hr className='my-12 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:opacity-100' />
        
        <div id="other-events" className='text-center'>
          {events 
          ? events.map((event, index) => {
            if (index !== selectedEventIndex) {
              return (
                <div key={index}> 
                  <p className='py-1'>{event.title} - {event.date}</p>
                </div>
              )
            }
          })
          : null}
        </div>
        
      </div>
    </main>
  )
}
