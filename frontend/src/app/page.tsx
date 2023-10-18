'use client'

import axios from 'axios'
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';

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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>

        <div className="current-event">
          {events.map((event, index) => {
            if (index === selectedEventIndex) {
              return (
                <div key={index}>
                  <div id="button-wrapper">
                  <button type="button" onClick={previousEvent}>Previous</button>
                  <button type="button" onClick={nextEvent}>Next</button>
                  </div>
                  <h1 id="event-title">{event.title}</h1>
                  <a href={event.event_url}>More info</a>
                  <h3 id="event-date">{event.date}</h3>
                  <div id="fight-container">
                    <ul id="fights-list">
                      { event.fights ? 
                        event.fights.map((fight, index) => {
                          return (
                              <li key={index}>{fight.fighter_one.name} vs. {fight.fighter_two.name} ({fight.weight})</li>
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

        <hr />
        
        <div id="other-events">
          {events 
          ? events.map((event, index) => {
            if (index !== selectedEventIndex) {
              return (
                <div key={index}> 
                  <p>{event.title} - {event.date}</p>
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
