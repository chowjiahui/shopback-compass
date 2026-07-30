import { loadIntents } from "@/lib/data";
import { CompassApp } from "@/components/CompassApp";

export default function Home() {
  const intents = loadIntents();
  return <CompassApp intents={intents} />;
}
