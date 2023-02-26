export function decimalMinutesToString(dm:number){
    const hours=Math.floor(dm/60)
    const minutes=Math.floor(dm-hours*60)
    const seconds=Math.floor((dm-minutes)*60-hours*3600)
    return`${hours.toString().padStart(2,'0')}h${minutes.toString().padStart(2,'0')}'${seconds.toString().padStart(2,'0')}"`
}