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
  const [events, setEvents] = useState<Event[] | null>();

  useEffect(() => {
    const url = 'https://floating-sierra-91917-e404c4f79857.herokuapp.com/events'
    axios.get(url).then((response) => {
      console.log(response)
      var eventsList = response.data

      const sortedEventsListByMostRecent = sortBy(eventsList, (event) => parseDate(event.date));
      console.log(`Sorted supposedly:\n${sortedEventsListByMostRecent}`)

      setEvents(sortedEventsListByMostRecent)
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        {events 
        ? events.map((event, index) => {
          return (
            <div key={index}> 
              <p>{event.title} - {event.date}</p>
            </div>
          )
        })
        : null}
      </div>
    </main>
  )
}
