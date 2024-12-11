'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import { sortBy } from 'lodash'
import Head from 'next/head' // Import the Head component

import SelectedEvent from '@/Components/SelectedEvent/SelectedEvent'
import ShortDivider from '@/Components/ShortDivider/ShortDivider'
import { Fight } from '@/Types/Fight'
import { Fighter } from '@/Types/Fighter'
import { Event } from '@/Types/Event'

function parseDate(dateString: string) {
  const parsedDate = new Date(dateString);
  return parsedDate
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedEventIndex, setSelectedEventIndex] = useState(0)
  const [ufcOnly, setUfcOnly] = useState(false)

  useEffect(() => {
    const url = '/new_mma_events.json'
    axios.get(url).then((response) => {
      var eventsList = response.data

      const sortedEventsListByMostRecent = sortBy(eventsList, (event) => parseDate(event.date))
  
      // Make sure we only display dates in the future.
      const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1))
      const filteredSortedEventsOnlyFutureDates: Event[] = sortedEventsListByMostRecent.filter((event) => parseDate(event.date) > yesterdayDate)

      setEvents(filteredSortedEventsOnlyFutureDates)
      setFilteredEvents(filteredSortedEventsOnlyFutureDates)
    });
  }, []);

  function nextEvent() {
    let newSelectedEvent = (selectedEventIndex + 1) < events.length ? (selectedEventIndex + 1) : selectedEventIndex
    setSelectedEventIndex(newSelectedEvent)
  }

  function previousEvent() {
    let newSelectedEvent = (selectedEventIndex - 1) >= 0 ? (selectedEventIndex - 1) : selectedEventIndex
    setSelectedEventIndex(newSelectedEvent)
  }

  function setEvent(index: number) {
    if (index !== selectedEventIndex) {
      setSelectedEventIndex(index)
    }
  }

  const goToEventPage = (eventURL: string) => {
    let newWindow = window.open(eventURL, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  const toggleUFCOnly = () => {
    let updatedUfcOnly = !ufcOnly
    setUfcOnly((prevUfcOnly) => !prevUfcOnly)

    if (updatedUfcOnly) {
      let filteredEvents = events.filter(event => event.organization.includes("UFC"))
      setFilteredEvents(filteredEvents)
    } else {
      setFilteredEvents(events)
    }

    setSelectedEventIndex(0)
  }

  return (
    <>
      <Head>
        <title>Upcoming MMA Events</title>
        <meta name="description" content="Discover the latest MMA events, including UFC fights, dates, and more." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between p-8">
        <div>
          <section>
            <div className="download-app-store">
              <a href='https://apps.apple.com/us/app/fight-watch/id6738202028'>
                <img src='download.svg'/>
              </a>
            </div>
          </section>
          <div className='current-event max-w-2xl'>
            {filteredEvents.map((event, index) => {
              if (index === selectedEventIndex) {
                return (
                  <div key={index}>
                    <div id="button-wrapper" className='flow-root px-5 w-full'>
                      <button 
                        className='px-4 float-left rounded-full disabled:text-gray-600' 
                        disabled={!(selectedEventIndex > 0)} 
                        onClick={previousEvent}>
                          <p className='underline font-semibold'>
                            {selectedEventIndex > 0 ? filteredEvents[selectedEventIndex - 1].title.slice(0,15) : null}{!(selectedEventIndex > 0) ? "" : "..."} &lt;&lt; Previous
                          </p>
                      </button>

                      <button 
                        className='px-4 float-right rounded-full disabled:text-gray-600'
                        disabled={(selectedEventIndex === filteredEvents.length - 1)} 
                        onClick={nextEvent}>
                          <p className='underline font-semibold'>
                            Next &gt;&gt; {selectedEventIndex === filteredEvents.length - 1 ? null : filteredEvents[selectedEventIndex + 1].title.slice(0,15)} {(selectedEventIndex === filteredEvents.length - 1) ? "" : "..."}
                          </p>
                      </button>
                    </div>

                    <div id="fight-container" className='text-center'>
                      <div id='toggle-ufc' className='pt-3'>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={ufcOnly} onClick={() => toggleUFCOnly()} onChange={e => {}} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                          <span className="ml-3 text-sm font-medium dark:text-gray-300">Show UFC Events Only</span>
                        </label>
                      </div>

                      <SelectedEvent 
                        event={event} 
                        goToEventPage={goToEventPage} 
                        isSoonest={index === 0}/>
                    </div>
                  </div>
                )
              } else {
                return null;
              }

            })}
          </div>

          <hr className='py-3' />
          
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
          <div>
        </div>
        </div>
      </main>
    </>
  )
}
