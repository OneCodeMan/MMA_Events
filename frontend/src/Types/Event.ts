import { Fight } from "./Fight";

export type Event = {
  organization: string;
  title: string;
  date: string;
  location: string;
  event_url: string;
  fights: Fight[];
}