package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"unicode"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly"
)

// Structs

type Event struct {
	Organization string  `json:"organization"`
	Title        string  `json:"title"`
	Location     string  `json:"location"`
	Date         string  `json:"date"`
	EventUrl     string  `json:"event_url"`
	Fights       []Fight `json:"fights"`
}

type Fighter struct {
	Name      string `json:"name"`
	Record    string `json:"record"`
	AvatarUrl string `json:"avatar_url"`
	// Wins      int    `json:"wins"`
	// Losses    int    `json:"losses"`
	// Draws     int    `json:"draws"`
	// NoContest int    `json:"no_contest"`
}
type ActiveFighter struct {
	Name      string `json:"name"`
	Record    string `json:"record"`
	AvatarUrl string `json:"avatar_url"`
	FightDate string `json:"date"`
}
type Fight struct {
	FighterOne  Fighter `json:"fighter_one"`
	FighterTwo  Fighter `json:"fighter_two"`
	WeightClass string  `json:"weight"`
	// Order       int     `json:"order"`
}

// Main

func main() {

	// solution here if you run into any deployment problems w. heroku:
	// https://stackoverflow.com/questions/43362014/heroku-no-default-language-could-be-detected-for-this-app-error-thrown-for-no
	// git subtree push --prefix backend heroku master
	runMMAScraper()
	// hostJSONOfEvents()

}

// REST API STUFF
func hostJSONOfEvents() {
	port := os.Getenv("PORT")
	router := gin.Default()

	router.Use(cors.Default())

	router.GET("/events", getEvents)
	router.Run(":" + port)
}

func getEvents(c *gin.Context) {
	events := parseJSONToEvents()
	c.IndentedJSON(http.StatusOK, events)
}

// Convert JSON to Event structs, for the API!!
func parseJSONToEvents() []Event {
	// Open the JSON file
	file, err := os.Open("mma_events.json")
	if err != nil {
		fmt.Println("Error opening file:", err)
		errorEvents := make([]Event, 0)
		return errorEvents
	}
	defer file.Close()

	// Decode the JSON data into a slice of Person objects
	var events []Event
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&events); err != nil {
		fmt.Println("Error decoding JSON:", err)
		return events
	}

	// Access the data
	for i, event := range events {
		fmt.Printf("Event %d:\n", i+1)
		fmt.Printf("Organization: %s\n", event.Organization)
		fmt.Printf("Location: %s\n", event.Title)
		fmt.Println()
	}

	return events

}

// Scrapes

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
	var activeFighters []ActiveFighter

	c.OnHTML("div#upcoming_tab tr", func(h *colly.HTMLElement) {
		extractedEventUrl := h.ChildAttr("td:nth-child(2) a", "href")
		fullEventUrl := h.Request.AbsoluteURL(extractedEventUrl)

		// Go to every event page
		if strings.Contains(fullEventUrl, "/events/") {
			c.Visit(fullEventUrl)
		}
	})

	c.OnHTML("div.col-left", func(h *colly.HTMLElement) {

		fullEventUrl := h.Request.URL.String()

		urlStart := "https://www.sherdog.com/"

		// Only run this if we're on an event page.
		// Other pages such 'organizations' have similar elements -- we do not want those.
		if strings.Contains(fullEventUrl, "/events/") {
			organizationName := h.ChildText("div.event_detail a[itemprop=url]")
			eventTitleString := h.ChildText("div.event_detail h1")
			eventDateString := h.ChildText("div.event_detail div.info span:nth-child(1)")
			eventLocationString := h.ChildText("span[itemprop=location]")

			if (strings.Contains(eventLocationString, "United States")) && strings.Contains(organizationName, "UFC") {
				eventDateString = eventDateString + " 8:00 P.M."
			} else if (strings.Contains(eventLocationString, "United Kingdom")) && strings.Contains(organizationName, "UFC") {
				eventDateString = eventDateString + " 3:00 P.M."
			} else if (strings.Contains(eventLocationString, "Thailand")) && strings.Contains(organizationName, "One Championship") {
				eventDateString = eventDateString + " 8:30 A.M."
			} else if strings.Contains(organizationName, "Bellator") || strings.Contains(organizationName, "Professional Fighters League") {
				eventDateString = eventDateString + " 8:00 P.M."
			} else {
				eventDateString = eventDateString + " 8:00 P.M."
			}

			// fmt.Println(organizationName, eventTitleString, eventDateString, eventLocationString)
			// fmt.Println("------------")

			fights := make([]Fight, 0)

			mainEventFighterOneName := h.ChildText("div.left_side h3")

			mainEventFighterTwoName := h.ChildText("div.right_side h3")

			if (mainEventFighterOneName != "") && (mainEventFighterTwoName != "") {
				// fmt.Printf("Main Event: %s vs. %s\n", mainEventFighterOneName, mainEventFighterTwoName)

				mainEventFighterOneAvatarUrl := urlStart + h.ChildAttr("div.left_side a img", "src")

				mainEventFighterOneRecord := h.ChildText("div.left_side span.record")
				mainEventFighterOne := Fighter{
					Name:      mainEventFighterOneName,
					Record:    mainEventFighterOneRecord,
					AvatarUrl: mainEventFighterOneAvatarUrl,
				}

				activeFighterOne := ActiveFighter{
					Name:      mainEventFighterOneName,
					Record:    mainEventFighterOneRecord,
					AvatarUrl: mainEventFighterOneAvatarUrl,
					FightDate: eventDateString,
				}

				activeFighters = append(activeFighters, activeFighterOne)

				mainEventFighterTwoAvatarUrl := urlStart + h.ChildAttr("div.right_side a img", "src")

				mainEventFighterTwoRecord := h.ChildText("div.right_side span.record")
				mainEventFighterTwo := Fighter{
					Name:      mainEventFighterTwoName,
					Record:    mainEventFighterTwoRecord,
					AvatarUrl: mainEventFighterTwoAvatarUrl,
				}

				activeFighterTwo := ActiveFighter{
					Name:      mainEventFighterTwoName,
					Record:    mainEventFighterTwoRecord,
					AvatarUrl: mainEventFighterTwoAvatarUrl,
					FightDate: eventDateString,
				}

				activeFighters = append(activeFighters, activeFighterTwo)

				mainEventWeightClass := h.ChildText("div.versus span.weight_class")

				mainEventFight := Fight{
					FighterOne:  mainEventFighterOne,
					FighterTwo:  mainEventFighterTwo,
					WeightClass: mainEventWeightClass,
				}

				// fmt.Println("MAIN EVENT", mainEventFight)
				fights = append(fights, mainEventFight)

				// Then do the rest of the fights
				h.ForEach("tr", func(i int, el *colly.HTMLElement) {
					fighterOneName := el.ChildText("div.fighter_list.left div.fighter_result_data span[itemprop=name]")
					sanitizedFighterOneName := separateAtNextCapital(fighterOneName)
					fighterOneRecord := el.ChildText("div.fighter_list.left div.fighter_result_data span.record")

					fighterOneAvatarUrl := urlStart + el.ChildAttr("div.fighter_list.left img.lazy", "src")

					fmt.Printf("Fighter 1: %s\nRecord:%s\n\n", sanitizedFighterOneName, fighterOneRecord)

					fighterOne := Fighter{
						Name:      sanitizedFighterOneName,
						Record:    fighterOneRecord,
						AvatarUrl: fighterOneAvatarUrl,
					}

					activeFighterOne := ActiveFighter{
						Name:      sanitizedFighterOneName,
						Record:    fighterOneRecord,
						AvatarUrl: fighterOneAvatarUrl,
						FightDate: eventDateString,
					}

					activeFighters = append(activeFighters, activeFighterOne)

					fighterTwoName := el.ChildText("div.fighter_list.right div.fighter_result_data span[itemprop=name]")
					sanitizedFighterTwoName := separateAtNextCapital(fighterTwoName)
					fighterTwoRecord := el.ChildText("div.fighter_list.right div.fighter_result_data span.record")

					fighterTwoAvatarUrl := urlStart + el.ChildAttr("div.fighter_list.right img.lazy", "src")

					fmt.Printf("Fighter 2: %s\nRecord: %s\n\n", sanitizedFighterTwoName, fighterTwoRecord)

					fighterTwo := Fighter{
						Name:      sanitizedFighterTwoName,
						Record:    fighterTwoRecord,
						AvatarUrl: fighterTwoAvatarUrl,
					}

					activeFighterTwo := ActiveFighter{
						Name:      sanitizedFighterTwoName,
						Record:    fighterTwoRecord,
						AvatarUrl: fighterTwoAvatarUrl,
						FightDate: eventDateString,
					}

					activeFighters = append(activeFighters, activeFighterTwo)

					weightClass := el.ChildText("span.weight_class")
					fmt.Printf("Weight class: %s\n\n\n", weightClass)

					currentFight := Fight{
						FighterOne:  fighterOne,
						FighterTwo:  fighterTwo,
						WeightClass: weightClass,
					}

					if currentFight.FighterOne.Name != "" && currentFight.FighterTwo.Name != "" {
						fights = append(fights, currentFight)
					}
				})
			}

			currentEvent := Event{
				Organization: organizationName,
				Title:        eventTitleString,
				Location:     eventLocationString,
				Date:         eventDateString,
				EventUrl:     fullEventUrl,
				Fights:       fights,
			}

			events = append(events, currentEvent)
		}

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
	createJSONFromActiveFighters(activeFighters, "active_fighters.json")
}

// Create JSON out of array of objects and save to JSON
func createJSONFromEvents(events []Event, jsonFileName string) {
	content, err := json.MarshalIndent(events, " ", "")

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Generated events of length", len(events))
	os.WriteFile(jsonFileName, content, 0644)
}

// Create JSON out of array of objects and save to JSON
func createJSONFromActiveFighters(activeFighters []ActiveFighter, jsonFileName string) {
	content, err := json.MarshalIndent(activeFighters, " ", "")

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Generated events of length", len(activeFighters))
	os.WriteFile(jsonFileName, content, 0644)
}

// There's gotta be a better way
func separateAtNextCapital(input string) string {
	for i, char := range input {
		if unicode.IsUpper(char) && i > 0 {
			return input[:i] + " " + input[i:]
		}
	}
	return input
}
