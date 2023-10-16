package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/gocolly/colly"
)

type Event struct {
	Organization string `json:"organization"`
	Title        string `json:"title"`
	Location     string `json:"location"`
	Date         string `json:"date"`
	EventUrl     string `json:"event_url"`
}

func main() {
	c := colly.NewCollector(
		colly.Async(true),
	)

	fmt.Println("Main running!")

	var events []Event

	// All events
	c.OnHTML("div.col-left", func(h *colly.HTMLElement) {
		organizationName := h.ChildText("div[itemprop=name]")

		h.ForEach("tr", func(_ int, el *colly.HTMLElement) {

			eventDateString := el.ChildText("td:nth-child(1)")
			eventTitleString := el.ChildText("td:nth-child(2)")
			eventLocationString := el.ChildText("td:nth-child(3)")

			extractedEventUrl := el.ChildAttr("td:nth-child(2) a", "href")
			fullEventUrl := h.Request.AbsoluteURL(extractedEventUrl)

			currentEvent := Event{
				Organization: organizationName,
				Title:        eventTitleString,
				Location:     eventLocationString,
				Date:         eventDateString,
				EventUrl:     fullEventUrl,
			}

			events = append(events, currentEvent)

		})
	})

	// Print out where we're going whenever we go there
	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
		fmt.Println("---------------")
	})

	c.Visit("https://www.sherdog.com/organizations/Ultimate-Fighting-Championship-UFC-2")
	c.Wait()

	// Create JSON out of array of objects and save to JSON
	content, err := json.MarshalIndent(events, " ", "")

	if err != nil {
		log.Fatal(err)
	}
	// fmt.Println(string(content))
	os.WriteFile("mma_events.json", content, 0644)
}
