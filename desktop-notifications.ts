import { listeners } from 'node:process';
import {spawnProcess, SpawnProcessResult} from './spawnProcess.ts';
export interface INotifier{
    info(title:string,detail:string):Promise<SpawnProcessResult>
    warning(title:string,detail:string):Promise<SpawnProcessResult>
    error(title:string,detail:string):Promise<SpawnProcessResult>
    notification(title:string,detail:string):Promise<SpawnProcessResult>
}
export const Zenity:INotifier = {
    async info(title:string,detail:string):Promise<SpawnProcessResult>{
        return await sendZenityMessage("info",title,detail)
    },
    async warning(title:string,detail:string):Promise<SpawnProcessResult>{
        return await sendZenityMessage("warning",title,detail)
    },
    async error(title:string,detail:string):Promise<SpawnProcessResult>{
        return await sendZenityMessage("error",title,detail)
    },
    async notification(title:string,detail:string):Promise<SpawnProcessResult>{
        return await sendZenityNotification(title,detail)
    }
}
function splitBodyText(text:string,maxCharsPerLine:number){
    return text.split(" ").reduce(
        (lines:string[][],word:string,num:number) => {
            let currentLine = lines[lines.length-1]
            const currentLineCharLength = currentLine.join(" ").length;
            if(currentLineCharLength > maxCharsPerLine) {
                currentLine=[word];
                lines.push(currentLine)
            }else{
                currentLine.push(word);
            }
            return lines;
        },[[]]
    ).map( line => line.join(" "))
    .join("\n")
}
export async function sendZenityMessage(type:"error"|"warning"|"notification"|"info",title:string,detail:string):Promise<SpawnProcessResult>{
    return await spawnProcess('zenity',[`--${type}`,`--text`,`<big>${title}</big>${"\n"}${splitBodyText(detail,10)}`])
}
export async function sendZenityNotification(title:string,detail:string):Promise<SpawnProcessResult>{
    const body = splitBodyText(detail,10)
    return await spawnProcess('zenity',[`--notification`,`--text`,`${title}${"\n"}${body}`,`--hint`,body])
}