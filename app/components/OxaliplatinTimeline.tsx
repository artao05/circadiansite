import { oxaliplatinEvents } from "../content/site-data";

export function OxaliplatinTimeline() {
  return (
    <div className="oxaliplatin-timeline">
      {oxaliplatinEvents.map((event, index) => (
        <article className="timeline-event" key={event.title}>
          <span className="timeline-index">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <p>{event.year}</p>
            <h3>{event.title}</h3>
            <span>{event.copy}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

