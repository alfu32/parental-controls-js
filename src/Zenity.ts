import { spawnProcess, SpawnProcessResult } from './spawnProcess.ts';
import { INotifier} from "./desktop-notifications.ts";
import { NotificationCategory, splitBodyText } from "./desktop-notifications.ts";

export const Zenity: INotifier = {
  async info(title: string, detail: string): Promise<SpawnProcessResult> {
    return await sendZenityMessage("info", title, detail);
  },
  async warning(title: string, detail: string): Promise<SpawnProcessResult> {
    return await sendZenityMessage("warning", title, detail);
  },
  async error(title: string, detail: string): Promise<SpawnProcessResult> {
    return await sendZenityMessage("error", title, detail);
  },
  async notification(title: string, detail: string): Promise<SpawnProcessResult> {
    return await sendZenityNotification(title, detail);
  }
};
export async function sendZenityMessage(type:NotificationCategory,title:string,detail:string):Promise<SpawnProcessResult>{
    return await spawnProcess('zenity',[`--${type}`,`--text`,`<big>${title}</big>${"\n"}${splitBodyText(detail,10)}`])
}
export async function sendZenityNotification(title:string,detail:string):Promise<SpawnProcessResult>{
    const body = splitBodyText(detail,10)
    return await spawnProcess('zenity',[`--notification`,`--text`,`${title}${"\n"}${body}`,`--hint`,body])
}
