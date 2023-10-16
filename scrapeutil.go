package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
)

// Create JSON out of array of objects and save to JSON
func createJSONFromEvents(events []Event, jsonFileName string) {
	content, err := json.MarshalIndent(events, " ", "")

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Generated events of length", len(events))
	os.WriteFile(jsonFileName, content, 0644)
}
