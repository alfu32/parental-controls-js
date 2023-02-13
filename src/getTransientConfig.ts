export function getTransientConfig(refDate: Date = new Date()): {
  dfolder: string;
  dprefix: string;
  hourMinute: string;
  d: Date;
  logs: string;
  countersDir: string;
  logfile: string;
  countfile: string;
} {
  const d = refDate.toString() === "Invalid Date" ? new Date() : refDate;
  const hourMinute = `${d.getHours().toString(10).padStart(2, "0")}${d.getMinutes().toString(10).padStart(2, "0")}`;
  const dfolder = `${d.getFullYear()}/${(d.getMonth() + 1).toString(10).padStart(2, "0")}`; // md.format("YYYY/MM")
  const dprefix = `${dfolder}/${d.getDate().toString(10).padStart(2, "0")}`; //md.format("YYYY/MM/DD")
  const logs = `logs/${dfolder}`;
  const countersDir = `counters/${dfolder}`;
  const logfile = `logs/${dprefix}.log`;
  const countfile = `counters/${dprefix}.json`;
  return {
    dfolder,
    dprefix,
    hourMinute,
    d,
    logs,
    countersDir,
    logfile,
    countfile,
  };
}
