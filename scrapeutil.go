package main

import (
	"encoding/json"
	"log"
	"os"
)

// Create JSON out of array of objects and save to JSON
func createJSONFromEvents(events []Event, jsonFileName string) {
	// sanitizedEvents := events[1:]
	content, err := json.MarshalIndent(events, " ", "")

	if err != nil {
		log.Fatal(err)
	}
	// fmt.Println(string(content))
	os.WriteFile(jsonFileName, content, 0644)
}
