'use client'

import axios from 'axios'
import { useEffect, useState } from 'react';

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

export default function Home() {
  const [events, setEvents] = useState<Event[] | null>();

  useEffect(() => {
    const url = 'https://floating-sierra-91917-e404c4f79857.herokuapp.com/events'
    axios.get(url).then((response) => {
      console.log(response)
      setEvents(response.data)
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
     {events 
      ? events.map((event) => {
        return <p>{event.title}</p>
      })
      : null}
    </main>
  )
}
