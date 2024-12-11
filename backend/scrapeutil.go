package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"unicode"
)

// Create JSON out of array of objects and save to JSON
func createJSONFromEvents(events []Event, jsonFileName string) {
	content, err := json.MarshalIndent(events, " ", "")

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Generated json items of length", len(events))
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
