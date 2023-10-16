package main

import (
	"fmt"

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
	runMMAScraper()
}

func runMMAScraper() {
	c := colly.NewCollector(
		colly.Async(true),
		// colly.MaxDepth(1),
		// colly.DetectCharset(),
		// colly.AllowURLRevisit(),
	)
	// c.SetRequestTimeout(120 * time.Second)

	fmt.Println("Main running!")

	var events []Event

	// All events
	c.OnHTML("div.col-left", func(h *colly.HTMLElement) {
		organizationName := h.ChildText("div[itemprop=name]")
		h.ForEach("div#upcoming_tab tr", func(_ int, el *colly.HTMLElement) {

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

			if (eventTitleString != "Fight Title") && (eventLocationString != "Location") && (eventDateString != "Date") {
				events = append(events, currentEvent)
			}

			// if strings.Contains(fullEventUrl, "/events/") {
			// 	fmt.Println("Visiting", fullEventUrl)
			// 	c.Visit(fullEventUrl)
			// }

		})
	})

	// Print out where we're going whenever we go there
	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
		fmt.Println("---------------")
	})

	// Error Handling
	c.OnError(func(r *colly.Response, e error) {
		fmt.Println("error:", e, r.Request.URL, string(r.Body))
	})

	// Actually visiting the URLs
	c.Visit("https://www.sherdog.com/organizations/Ultimate-Fighting-Championship-UFC-2")
	c.Visit("https://www.sherdog.com/organizations/Bellator-MMA-1960")
	c.Visit("https://www.sherdog.com/organizations/Professional-Fighters-League-12241")
	c.Visit("https://www.sherdog.com/organizations/ONE-Championship-3877")
	c.Wait()

	createJSONFromEvents(events, "mma_events.json")
}
