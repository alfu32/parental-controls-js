import { existsSync, writeFileSync } from 'node:fs';
import { listeners } from 'node:process';
import { mkdirp } from './classes.ts';
import {spawnProcess, SpawnProcessResult} from './spawnProcess.ts';
export declare type NotificationCategory = "error"|"warning"|"notification"|"info";

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
export const NotifySend:INotifier = {
    async info(title:string,detail:string):Promise<SpawnProcessResult>{
        return await sendNotifySendNotification("info",title,detail)
    },
    async warning(title:string,detail:string):Promise<SpawnProcessResult>{
        return await sendNotifySendNotification("warning",title,detail)
    },
    async error(title:string,detail:string):Promise<SpawnProcessResult>{
        return await sendNotifySendNotification("error",title,detail)
    },
    async notification(title:string,detail:string):Promise<SpawnProcessResult>{
        return await sendNotifySendNotification("notification",title,detail)
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
export async function sendZenityMessage(type:NotificationCategory,title:string,detail:string):Promise<SpawnProcessResult>{
    return await spawnProcess('zenity',[`--${type}`,`--text`,`<big>${title}</big>${"\n"}${splitBodyText(detail,10)}`])
}
export async function sendZenityNotification(title:string,detail:string):Promise<SpawnProcessResult>{
    const body = splitBodyText(detail,10)
    return await spawnProcess('zenity',[`--notification`,`--text`,`${title}${"\n"}${body}`,`--hint`,body])
}

///////////  Usage:
///////////    notify-send [OPTION...] <SUMMARY> [BODY] - create a notification
///////////  
///////////  Help Options:
///////////    -?, --help                        Show help options
///////////  
///////////  Application Options:
///////////    -u, --urgency=LEVEL               Specifies the urgency level (low, normal, critical).
///////////    -t, --expire-time=TIME            Specifies the timeout in milliseconds at which to expire the notification.
///////////    -i, --icon=ICON[,ICON...]         Specifies an icon filename or stock icon to display.
///////////    -c, --category=TYPE[,TYPE...]     Specifies the notification category.
///////////    -h, --hint=TYPE:NAME:VALUE        Specifies basic extra data to pass. Valid types are int, double, string and byte.
///////////    -v, --version                     Version of the package.

export async function sendNotifySendNotification(type:NotificationCategory,title:string,detail:string):Promise<SpawnProcessResult>{
    const icons_mapping:{[cat:string]:NotifySendIcon}={
        "error":"error",
        "info":"dialog-information",
        "warning":"dialog-warning",
        "notification":"computer-fail",
    }
    const body = splitBodyText(detail,10)
    let spr;
    try{
        spr = await(new NotifySendData()
        .category("presence")
        .icon(icons_mapping[type])
        .summary(title)
        .body(body)
        .send());
        return spr;
    }catch(err){
        console.error("ERROR.sendNotifySendNotification",err)
        return {out:"",error:err};
    }
    
}
class NotifySendData{
    _urgency:NotifySendUrgency="low";
    _expireTimeMillis:number=5000;
    _icon:NotifySendIcon="dialog-information";
    _category:NotifySendCategory="presence";
    _summary:string="";
    _body:string="";
    urgency(urgencyValue:NotifySendUrgency):this{
        this._urgency=urgencyValue;
        return this;
    }
    expireTimeMillis(expireTimeMillisValue:number):this{
        this._expireTimeMillis=expireTimeMillisValue;
        return this;
    }
    icon(iconValue:NotifySendIcon):this{
        this._icon=iconValue;
        return this;
    }
    category(categoryValue:NotifySendCategory):this{
        this._category=categoryValue;
        return this;
    }
    summary(summaryValue:string):this{
        this._summary=summaryValue;
        return this;
    }
    body(bodyValue:string):this{
        this._body=bodyValue;
        return this;
    }
    toString(){
        return `{
            _urgency:${this._urgency},
            _expireTimeMillis:${this._expireTimeMillis},
            _icon:${this._icon},
            _category:${this._category},
            _summary:${this._summary},
            _body:${this._body},
        }`
    }
    command(){
        return `notify-send --urgency ${this._urgency} --expire-time ${this._expireTimeMillis} --icon ${this._icon} --category ${this._category} "${this._summary}" "${this._body.replace(/\n/gi,"\\n")}"`
    }
    async senddeno():Promise<SpawnProcessResult>{
        console.log("NOTIFYSEND.spawnprocess",this.toString())
        if( !existsSync("notifications") ){
            mkdirp("notifications/todo")
            // mkdirp("notifications/done")
        }
        const rname=`${Date.now()}.${Math.random()}`
        writeFileSync(`notifications/todo/${rname}`,this.command())
        let out="";
        // deno-lint-ignore no-explicit-any
        let error:any;
        try{
            const proc = await Deno.run({cmd:[
                'notify-send',
                "--urgency",this._urgency,
                "--expire-time",this._expireTimeMillis.toString(10),
                "--icon",this._icon,
                "--category",this._category,
                this._summary,
                this._body,
            ]})
            const errbuf=new Uint8Array(2048);
            const outbuf=new Uint8Array(2048);
            await proc.stdout?.read(outbuf);
            await proc.stderr?.read(errbuf);
            out=new TextDecoder().decode(outbuf);
            error=new TextDecoder().decode(errbuf);
        }catch(err){
            error=err
        }
        return {out,error}
    }
    async send():Promise<SpawnProcessResult>{
        console.log("NOTIFYSEND.spawnprocess",this.toString())
        if( !existsSync("notifications") ){
            mkdirp("notifications/todo")
            // mkdirp("notifications/done")
        }
        const rname=`${Date.now()}.${Math.random()}`
        writeFileSync(`notifications/todo/${rname}`,this.command())
        
        return await spawnProcess('notify-send',[
            "--urgency",this._urgency,
            "--expire-time",this._expireTimeMillis.toString(10),
            "--icon",this._icon,
            "--category",this._category,
            this._summary,
            this._body,
        ],{

        })
    }
}


export declare type NotifySendIcon = "add"| "address-book-new"| "application-exit"| "appointment-new"| "appointment"| "back"| "bookmark_add"| "bookmark-new"| "bookmarks_list_add"| "bottom"| "call-start"| "call-stop"| "centrejust"| "contact-new"| "document-new"| "document-open"| "document-open-recent"| "document-page-setup"| "document-print"| "document-print-preview"| "document-properties"| "document-revert"| "document-revert-rtl"| "document-save-as"| "document-save"| "document-send"| "down"| "edit-clear"| "editclear"| "edit-copy"| "editcopy"| "edit-cut"| "editcut"| "edit-delete"| "editdelete"| "edit-find"| "edit-find-replace"| "edit-paste"| "editpaste"| "edit-redo"| "edit-redo-rtl"| "edit-select-all"| "edit-undo"| "edit-undo-rtl"| "exit"| "filefind"| "filenew"| "fileopen"| "fileprint"| "filequickprint"| "filesaveas"| "filesave"| "find"| "finish"| "folder_new"| "folder-new"| "format-indent-less"| "format-indent-less-rtl"| "format-indent-more"| "format-indent-more-rtl"| "format-justify-center"| "format-justify-fill"| "format-justify-left"| "format-justify-right"| "format-text-bold"| "format-text-direction-ltr"| "format-text-direction-rtl"| "format-text-italic"| "format-text-strikethrough"| "format-text-underline"| "forward"| "gnome-lockscreen"| "gnome-logout"| "gnome-run"| "gnome-searchtool"| "gnome-session-logout"| "gnome-shutdown"| "gnome-stock-mail-fwd"| "gnome-stock-mail-new"| "gnome-stock-mail-rpl"| "gnome-stock-mail-snd"| "gnome-stock-text-indent"| "gnome-stock-text-unindent"| "go-bottom"| "go-down"| "go-first"| "go-first-rtl"| "go-home"| "gohome"| "go-jump"| "go-last"| "go-last-rtl"| "go-next"| "go-next-rtl"| "go-previous"| "go-previous-rtl"| "go-top"| "go-up"| "gtk-about"| "gtk-add"| "gtk-bold"| "gtk-cancel"| "gtk-clear"| "gtk-close"| "gtk-copy"| "gtk-cut"| "gtk-delete"| "gtk-execute"| "gtk-find-and-replace"| "gtk-find"| "gtk-fullscreen"| "gtk-go-back-ltr"| "gtk-go-back-rtl"| "gtk-go-down"| "gtk-go-forward-ltr"| "gtk-go-forward-rtl"| "gtk-goto-bottom"| "gtk-goto-first-ltr"| "gtk-goto-first-rtl"| "gtk-goto-last-ltr"| "gtk-goto-last-rtl"| "gtk-goto-top"| "gtk-go-up"| "gtk-help"| "gtk-home"| "gtk-indent-ltr"| "gtk-indent-rtl"| "gtk-italic"| "gtk-jump-to-ltr"| "gtk-jump-to-rtl"| "gtk-justify-center"| "gtk-justify-fill"| "gtk-justify-left"| "gtk-justify-right"| "gtk-leave-fullscreen"| "gtk-media-forward-ltr"| "gtk-media-forward-rtl"| "gtk-media-next-ltr"| "gtk-media-next-rtl"| "gtk-media-pause"| "gtk-media-play-ltr"| "gtk-media-previous-ltr"| "gtk-media-previous-rtl"| "gtk-media-record"| "gtk-media-rewind-ltr"| "gtk-media-rewind-rtl"| "gtk-media-stop"| "gtk-new"| "gtk-open"| "gtk-paste"| "gtk-print"| "gtk-print-preview"| "gtk-properties"| "gtk-quit"| "gtk-redo-ltr"| "gtk-refresh"| "gtk-remove"| "gtk-revert-to-saved-ltr"| "gtk-revert-to-saved-rtl"| "gtk-save-as"| "gtk-save"| "gtk-select-all"| "gtk-sort-ascending"| "gtk-sort-descending"| "gtk-spell-check"| "gtk-stop"| "gtk-strikethrough"| "gtk-underline"| "gtk-undo-ltr"| "gtk-unindent-ltr"| "gtk-unindent-rtl"| "gtk-zoom-100"| "gtk-zoom-fit"| "gtk-zoom-in"| "gtk-zoom-out"| "help-about"| "help-contents"| "help-faq"| "help"| "insert-image"| "insert-link"| "insert-object"| "insert-text"| "kfind"| "kfm_home"| "leftjust"| "list-add"| "list-remove"| "lock"| "mail_forward"| "mail-forward"| "mail-mark-important"| "mail-mark-junk"| "mail-mark-notjunk"| "mail-mark-read"| "mail-mark-unread"| "mail-message-new"| "mail_new"| "mail_replyall"| "mail-reply-all"| "mail_reply"| "mail-reply-sender"| "mail_send"| "mail-send"| "mail-send-receive"| "mail_spam"| "media-eject"| "media-playback-pause"| "media-playback-start"| "media-playback-start-rtl"| "media-playback-stop"| "media-record"| "media-seek-backward"| "media-seek-backward-rtl"| "media-seek-forward"| "media-seek-forward-rtl"| "media-skip-backward"| "media-skip-backward-rtl"| "media-skip-forward"| "media-skip-forward-rtl"| "next"| "object-flip-horizontal"| "object-flip-vertical"| "object-rotate-left"| "object-rotate-right"| "player_eject"| "player_end"| "player_fwd"| "player_pause"| "player_play"| "player_record"| "player_rew"| "player_start"| "player_stop"| "previous"| "process-stop"| "redhat-home"| "redo"| "reload3"| "reload_all_tabs"| "reload_page"| "reload"| "remove"| "revert"| "rightjust"| "search"| "start"| "stock_about"| "stock_add-bookmark"| "stock_bottom"| "stock_close"| "stock_copy"| "stock_cut"| "stock_delete"| "stock_down"| "stock_file-properites"| "stock_first"| "stock_fullscreen"| "stock_help-add-bookmark"| "stock_help"| "stock_home"| "stock_last"| "stock_leave-fullscreen"| "stock_left"| "stock_mail-compose"| "stock_mail-forward"| "stock_mail-reply"| "stock_mail-reply-to-all"| "stock_mail-send"| "stock_mail-send-receive"| "stock_media-fwd"| "stock_media-next"| "stock_media-pause"| "stock_media-play"| "stock_media-prev"| "stock_media-rec"| "stock_media-rew"| "stock_media-stop"| "stock_new-address-book"| "stock_new-appointment"| "stock_new-bcard"| "stock_new-dir"| "stock_new-text"| "stock_new-window"| "stock_paste"| "stock_print"| "stock_print-preview"| "stock_print-setup"| "stock_properties"| "stock_redo"| "stock_refresh"| "stock_right"| "stock_save-as"| "stock_save"| "stock_search-and-replace"| "stock_search"| "stock_select-all"| "stock_spam"| "stock_spellcheck"| "stock_stop"| "stock_text_bold"| "stock_text_center"| "stock_text_indent"| "stock_text_italic"| "stock_text_justify"| "stock_text_left"| "stock_text_right"| "stock_text-strikethrough"| "stock_text_underlined"| "stock_text_unindent"| "stock_top"| "stock_undo"| "stock_up"| "stock_zoom-1"| "stock_zoom-in"| "stock_zoom-out"| "stock_zoom-page"| "stop"| "system-lock-screen"| "system-log-out"| "system-run"| "system-search"| "system-shutdown"| "text_bold"| "text_italic"| "text_strike"| "text_under"| "tools-check-spelling"| "top"| "undo"| "up"| "view-fullscreen"| "viewmag1"| "viewmagfit"| "viewmag-"| "viewmag+"| "view-refresh"| "view-restore"| "view-sort-ascending"| "view-sort-descending"| "window-close"| "window_fullscreen"| "window_new"| "window-new"| "window_nofullscreen"| "xfce-system-exit"| "xfce-system-lock"| "zoom-best-fit"| "zoom-fit-best"| "zoom-in"| "zoom-original"| "zoom-out"| "gnome-spinner"| "process-working"| "accessibility-directory"| "accessories-calculator"| "accessories-character-map"| "accessories-dictionary"| "accessories-text-editor"| "access"| "applets-screenshooter"| "arts"| "background"| "calc"| "config-language"| "config-users"| "file-manager"| "fonts"| "gnome-calculator"| "gnome-character-map"| "gnome-help"| "gnome-mixer"| "gnome-monitor"| "gnome-remote-desktop"| "gnome-settings-accessibility-technologies"| "gnome-settings-background"| "gnome-settings-font"| "gnome-settings-keybindings"| "gnome-settings-theme"| "gnome-terminal"| "gnome-window-manager"| "gucharmap"| "help-browser"| "kcalc"| "kcharselect"| "kcmkwm"| "kcmsound"| "kedit"| "key_bindings"| "kfm"| "khelpcenter"| "konsole"| "krfb"| "kscreensaver"| "ksysguard"| "kuser"| "kwin"| "libreoffice-base"| "libreoffice-calc"| "libreoffice-draw"| "libreoffice-impress"| "libreoffice-main"| "libreoffice-math"| "libreoffice-startcenter"| "libreoffice-writer"| "locale"| "multimedia"| "multimedia-volume-control"| "openterm"| "preferences-desktop-accessibility"| "preferences-desktop-display"| "preferences-desktop-font"| "preferences-desktop-keyboard"| "preferences-desktop-keyboard-shortcuts"| "preferences-desktop-locale"| "preferences-desktop-remote-desktop"| "preferences-desktop-screensaver"| "preferences-desktop-theme"| "preferences-desktop-wallpaper"| "preferences-system-notifications"| "preferences-system-privacy"| "preferences-system-search"| "preferences-system-sharing"| "preferences-system-windows"| "redhat-filemanager"| "screensaver"| "style"| "susehelpcenter"| "system-config-users"| "system-file-manager"| "system-software-install"| "system-software-update"| "system-users"| "terminal"| "text-editor"| "update-manager"| "user-info"| "utilities-system-monitor"| "utilities-terminal"| "volume-knob"| "wallpaper"| "web-browser"| "xfce4-backdrop"| "xfce4-mixer"| "xfce4-ui"| "xfce-edit"| "xfce-filemanager"| "xfce-man"| "xfce-terminal"| "xfwm4"| "xscreensaver"| "zen-icon"| "applications-accessories"| "applications-development"| "applications-engineering"| "applications-games"| "applications-graphics"| "applications-internet"| "applications-multimedia"| "applications-office"| "applications-other"| "applications-science"| "applications-system"| "applications-utilities"| "gnome-applications"| "gnome-devel"| "gnome-globe"| "gnome-graphics"| "gnome-joystick"| "gnome-multimedia"| "gnome-other"| "gnome-settings"| "gnome-system"| "gnome-util"| "gtk-preferences"| "input_devices_settings"| "kcontrol"| "package_development"| "package_games"| "package_graphics"| "package_multimedia"| "package_network"| "package_office"| "package_settings"| "package_system"| "package_utilities"| "preferences-desktop-peripherals"| "preferences-desktop-personal"| "preferences-desktop"| "preferences-other"| "preferences-system-network"| "preferences-system"| "redhat-accessories"| "redhat-games"| "redhat-graphics"| "redhat-internet"| "redhat-office"| "redhat-preferences"| "redhat-programming"| "redhat-sound_video"| "redhat-system_settings"| "redhat-system_tools"| "stock_internet"| "system-help"| "xfce4-settings"| "xfce-devel"| "xfce-games"| "xfce-graphics"| "xfce-internet"| "xfce-multimedia"| "xfce-office"| "xfce-system"| "xfce-system-settings"| "xfce-utils"| "3floppy_unmount"| "ac-adapter"| "audio-card"| "audio-headphones"| "audio-headset"| "audio-input-microphone"| "audio-speakers"| "battery"| "camera-photo"| "camera"| "camera_unmount"| "camera-video"| "camera-web"| "cdrom_unmount"| "cdwriter_unmount"| "chardevice"| "computer"| "display"| "drive-cdrom"| "drive-harddisk"| "drive-multidisk"| "drive-optical"| "drive-removable-media"| "dvd_unmount"| "gnome-dev-battery"| "gnome-dev-cdrom-audio"| "gnome-dev-cdrom"| "gnome-dev-computer"| "gnome-dev-disc-cdr"| "gnome-dev-disc-cdrw"| "gnome-dev-disc-dvdram"| "gnome-dev-disc-dvdrom"|
    "gnome-dev-disc-dvdr-plus"| "gnome-dev-disc-dvdr"| "gnome-dev-disc-dvdrw"| "gnome-dev-dvd"| "gnome-dev-ethernet"| "gnome-dev-floppy"| "gnome-dev-harddisk-1394"| "gnome-dev-harddisk"| "gnome-dev-harddisk-usb"| "gnome-dev-ipod"| "gnome-dev-keyboard"| "gnome-dev-media-cf"| "gnome-dev-media-ms"| "gnome-dev-media-sdmmc"| "gnome-dev-media-sm"| "gnome-dev-mouse-ball"| "gnome-dev-mouse-optical"| "gnome-dev-printer"| "gnome-dev-removable-1394"| "gnome-dev-removable"| "gnome-dev-removable-usb"| "gnome-dev-wavelan"| "gnome-fs-client"| "gnome-modem"| "gnome-stock-mic"| "gtk-cdrom"| "gtk-floppy"| "gtk-harddisk"| "harddrive"| "hdd_unmount"| "input-dialpad"| "input-gaming"| "input-keyboard"| "input-mouse"| "input-tablet"| "input-touchpad"| "ipod_mount"| "joystick"| "keyboard"| "kjobviewer"| "kxkb"| "media-cdrom"| "media-flash"| "media-floppy"| "media-optical"| "media-removable"| "media-tape"| "modem"| "mouse"| "multimedia-player"| "network-vpn"| "network-wired"| "network-wireless"| "nm-adhoc"| "nm-device-wired"| "nm-device-wireless"| "pda"| "phone"| "printer1"| "printer-network"| "printer"| "printer-remote"| "printmgr"| "scanner"| "stock_cell-phone"| "stock_mic"| "stock_printers"| "system-floppy"| "system"| "uninterruptible-power-supply"| "usbpendrive_unmount"| "video-display"| "xfce4-display"| "xfce4-keyboard"| "xfce4-mouse"| "xfce-printer"| "yast_HD"| "yast_idetude"| "yast_joystick"| "yast_mouse"| "yast_printer"| "yast_soundcard"| "emblem-default"| "emblem-documents"| "emblem-downloads"| "emblem-favorite"| "emblem-generic"| "emblem-important"| "emblem-mail"| "emblem-new"| "emblem-noread"| "emblem-nowrite"| "emblem-package"| "emblem-photos"| "emblem-readonly"| "emblem-shared"| "emblem-symbolic-link"| "emblem-synchronizing"| "emblem-system"| "emblem-unreadable"| "emblem-urgent"| "emblem-web"| "face-angel"| "face-angry"| "face-cool"| "face-crying"| "face-devilish"| "face-embarrassed"| "face-glasses"| "face-kiss"| "face-laugh"| "face-monkey"| "face-plain"| "face-raspberry"| "face-sad"| "face-sick"| "face-smile-big"| "face-smile"| "face-smirk"| "face-surprise"| "face-tired"| "face-uncertain"| "face-wink"| "face-worried"| "stock_smiley-10"| "stock_smiley-11"| "stock_smiley-13"| "stock_smiley-15"| "stock_smiley-18"| "stock_smiley-1"| "stock_smiley-22"| "stock_smiley-2"| "stock_smiley-3"| "stock_smiley-4"| "stock_smiley-5"| "stock_smiley-6"| "stock_smiley-7"| "stock_smiley-8"| "application-certificate"| "application-vnd.ms-excel.sheet.macroEnabled.12"| "application-vnd.ms-powerpoint.presentation.macroEnabled.12"| "application-vnd.ms-word.document.macroEnabled.12"| "application-vnd.openxmlformats-officedocument.presentationml.presentation"| "application-vnd.openxmlformats-officedocument.presentationml.template"| "application-vnd.openxmlformats-officedocument.spreadsheetml.sheet"| "application-vnd.openxmlformats-officedocument.spreadsheetml.template"| "application-vnd.openxmlformats-officedocument.wordprocessingml.document"| "application-vnd.openxmlformats-officedocument.wordprocessingml.template"| "application-x-addon"| "application-x-executable"| "ascii"| "audio-x-generic"| "binary"| "contents2"| "deb"| "document"| "empty"| "exec"| "folder_tar"| "font_bitmap"| "font"| "font_truetype"| "font_type1"| "font-x-generic"| "gnome-fs-executable"| "gnome-fs-regular"| "gnome-mime-application-magicpoint"| "gnome-mime-application-msword"| "gnome-mime-application-ogg"| "gnome-mime-application-pdf"| "gnome-mime-application-postscript"| "gnome-mime-application-rtf"| "gnome-mime-application-vnd.lotus-1-2-3"| "gnome-mime-application-vnd.ms-excel"| "gnome-mime-application-vnd.ms-powerpoint"| "gnome-mime-application-vnd.oasis.opendocument.graphics"| "gnome-mime-application-vnd.oasis.opendocument.graphics-template"| "gnome-mime-application-vnd.oasis.opendocument.image"| "gnome-mime-application-vnd.oasis.opendocument.presentation"| "gnome-mime-application-vnd.oasis.opendocument.presentation-template"| "gnome-mime-application-vnd.oasis.opendocument.spreadsheet"| "gnome-mime-application-vnd.oasis.opendocument.spreadsheet-template"| "gnome-mime-application-vnd.oasis.opendocument.text"| "gnome-mime-application-vnd.oasis.opendocument.text-template"| "gnome-mime-application-vnd.oasis.opendocument.text-web"| "gnome-mime-application-vnd.rn-realmedia"| "gnome-mime-application-vnd.rn-realmedia-secure"| "gnome-mime-application-vnd.rn-realmedia-vbr"| "gnome-mime-application-vnd.stardivision.calc"| "gnome-mime-application-vnd.stardivision.impress"| "gnome-mime-application-vnd.stardivision.writer"| "gnome-mime-application-vnd.sun.xml.calc"| "gnome-mime-application-vnd.sun.xml.calc.template"| "gnome-mime-application-vnd.sun.xml.draw"| "gnome-mime-application-vnd.sun.xml.draw.template"| "gnome-mime-application-vnd.sun.xml.impress"| "gnome-mime-application-vnd.sun.xml.impress.template"| "gnome-mime-application-vnd.sun.xml.writer"| "gnome-mime-application-vnd.sun.xml.writer.template"| "gnome-mime-application-wordperfect"| "gnome-mime-application-x-7z-compressed"| "gnome-mime-application-x-abiword"| "gnome-mime-application-x-applix-spreadsheet"| "gnome-mime-application-x-applix-word"| "gnome-mime-application-x-archive"| "gnome-mime-application-x-arj"| "gnome-mime-application-x-bzip-compressed-tar"| "gnome-mime-application-x-bzip"| "gnome-mime-application-x-compressed-tar"| "gnome-mime-application-x-compress"| "gnome-mime-application-x-cpio-compressed"| "gnome-mime-application-x-cpio"| "gnome-mime-application-x-deb"| "gnome-mime-application-x-dvi"| "gnome-mime-application-x-executable"| "gnome-mime-application-x-font-afm"| "gnome-mime-application-x-font-bdf"| "gnome-mime-application-x-font-linux-psf"| "gnome-mime-application-x-font-pcf"| "gnome-mime-application-x-font-sunos-news"| "gnome-mime-application-x-font-ttf"| "gnome-mime-application-x-gnumeric"| "gnome-mime-application-x-gzip"| "gnome-mime-application-x-gzpostscript"| "gnome-mime-application-xhtml+xml"| "gnome-mime-application-x-jar"| "gnome-mime-application-x-killustrator"| "gnome-mime-application-x-kpresenter"| "gnome-mime-application-x-kspread"| "gnome-mime-application-x-kword"| "gnome-mime-application-x-lha"| "gnome-mime-application-x-lhz"| "gnome-mime-application-x-lzma-compressed-tar"| "gnome-mime-application-x-lzma"| "gnome-mime-application-x-ms-dos-executable"| "gnome-mime-application-x-perl"| "gnome-mime-application-x-php"| "gnome-mime-application-x-python-bytecode"| "gnome-mime-application-x-rar"| "gnome-mime-application-x-rpm"| "gnome-mime-application-x-scribus"| "gnome-mime-application-x-shellscript"| "gnome-mime-application-x-shockwave-flash"| "gnome-mime-application-x-stuffit"| "gnome-mime-application-x-tar"| "gnome-mime-application-x-tarz"| "gnome-mime-application-x-tex"| "gnome-mime-application-zip"| "gnome-mime-audio"| "gnome-mime-image"| "gnome-mime-text-html"| "gnome-mime-text"| "gnome-mime-text-vnd.wap.wml"| "gnome-mime-text-x-csh"| "gnome-mime-text-x-python"| "gnome-mime-text-x-sh"| "gnome-mime-text-x-vcalendar"| "gnome-mime-text-x-vcard"| "gnome-mime-text-x-zsh"| "gnome-mime-video"| "gnome-mime-x-font-afm"| "gnome-package"| "gtk-file"| "html"| "image"| "image-x-generic"| "kpresenter_kpr"| "libreoffice-database"| "libreoffice-drawing"| "libreoffice-drawing-template"| "libreoffice-extension"| "libreoffice-formula"| "libreoffice-master-document"| "libreoffice-oasis-database"| "libreoffice-oasis-drawing"| "libreoffice-oasis-drawing-template"| "libreoffice-oasis-formula"| "libreoffice-oasis-master-document"| "libreoffice-oasis-presentation"| "libreoffice-oasis-presentation-template"| "libreoffice-oasis-spreadsheet"| "libreoffice-oasis-spreadsheet-template"| "libreoffice-oasis-text"| "libreoffice-oasis-text-template"| "libreoffice-oasis-web-template"| "libreoffice-presentation"| "libreoffice-presentation-template"| "libreoffice-spreadsheet"| "libreoffice-spreadsheet-template"| "libreoffice-text"| "libreoffice-text-template"| "mime_ascii"| "misc"| "package_editors"| "package"| "package_wordprocessing"| "package-x-generic"| "plan"| "rpm"| "shellscript"| "sound"| "spreadsheet"| "stock_addressbook"| "stock_calendar"| "stock_certificate"| "stock_script"| "tar"| "template_source"| "text-html"| "text-x-generic"| "text-x-generic-template"| "text-x-preview"| "text-x-script"| "tgz"| "txt2"| "txt"| "unknown"| "vcalendar"| "vcard"| "video"| "video-x-generic"| "wordprocessing"| "www"| "x-office-address-book"| "x-office-calendar"| "x-office-document"| "x-office-document-template"| "x-office-drawing"| "x-office-drawing-template"| "x-office-presentation"| "x-office-presentation-template"| "x-office-spreadsheet"| "x-office-spreadsheet-template"| "x-package-repository"| "zip"| "application-x-gnome-saved-search"| "debian-swirl"| "desktop"| "distributor-logo"| "emptytrash"| "folder-documents"| "folder-download"| "folder_home"| "folder-music"| "folder-pictures"| "folder"| "folder-publicshare"| "folder-remote"| "folder-saved-search"| "folder-templates"| "folder-videos"| "gnome-foot"| "gnome-fs-desktop"| "gnome-fs-directory"| "gnome-fs-ftp"| "gnome-fs-home"| "gnome-fs-network"| "gnome-fs-nfs"| "gnome-fs-server"| "gnome-fs-share"| "gnome-fs-smb"| "gnome-fs-ssh"| "gnome-fs-trash-empty"| "gnome-main-menu"| "gnome-mime-x-directory-nfs-server"| "gnome-mime-x-directory-smb-server"| "gnome-mime-x-directory-smb-share"| "gnome-mime-x-directory-smb-workgroup"| "gnome-stock-trash"| "gtk-directory"| "gtk-network"| "inode-directory"| "network_local"| "network"| "network-server"| "network-workgroup"| "novell-button"| "redhat-network-server"| "server"| "start-here"| "stock_folder"| "trashcan_empty"| "user-bookmarks"| "user-desktop"| "user-home"| "user-trash"| "xfce-trash_empty"| "appointment-missed"| "appointment-soon"| "audio-volume-high"| "audio-volume-low"| "audio-volume-medium"| "audio-volume-muted"| "avatar-default"| "battery-caution-charging"| "battery-caution"| "battery-empty"| "battery-full-charged"| "battery-full-charging"| "battery-full"| "battery-good-charging"| "battery-good"| "battery-low-charging"| "battery-low"|
    "battery-missing"| "changes-allow"| "changes-prevent"| "computer-fail"| "connect_creating"| "connect_established"| "connect_no"| "dialog-error"| "dialog-information"| "dialog-password"| "dialog-question"| "dialog-warning"| "edittrash"| "error"| "folder-drag-accept"| "folder_open"| "folder-open"| "folder-visiting"| "gnome-fs-directory-accept"| "gnome-fs-directory-visiting"| "gnome-fs-loading-icon"| "gnome-fs-trash-full"| "gnome-netstatus-disconn"| "gnome-netstatus-error"| "gnome-netstatus-idle"| "gnome-netstatus-rx"| "gnome-netstatus-tx"| "gnome-netstatus-txrx"| "gnome-stock-trash-full"| "gtk-dialog-authentication"| "gtk-dialog-error"| "gtk-dialog-info"| "gtk-dialog-question"| "gtk-dialog-warning"| "gtk-directory"| "gtk-missing-image"| "image-loading"| "image-missing"| "important"| "info"| "mail-attachment"| "mail-read"| "mail-replied"| "mail-unread"| "media-playlist-repeat"| "media-playlist-shuffle"| "messagebox_critical"| "messagebox_info"| "messagebox_warning"| "microphone-sensitivity-high"| "microphone-sensitivity-low"| "microphone-sensitivity-medium"| "microphone-sensitivity-muted"| "network-cellular-connected"| "network-error"| "network-idle"| "network-offline"| "network-receive"| "network-transmit"| "network-transmit-receive"| "network-wired-disconnected"| "nm-no-connection"| "non-starred"| "printer-error"| "printer-printing"| "security-high"| "security-low"| "security-medium"| "semi-starred"| "semi-starred-rtl"| "software-update-available"| "software-update-urgent"| "starred"| "stock_appointment-reminder-excl"| "stock_appointment-reminder"| "stock_attach"| "stock_dialog-error"| "stock_dialog-info"| "stock_dialog-question"| "stock_dialog-warning"| "stock_lock-broken"| "stock_lock-ok"| "stock_lock-open"| "stock_lock"| "stock_mail-open"| "stock_mail-replied"| "stock_mail-unread"| "stock_open"| "stock_repeat"| "stock_shuffle"| "stock_trash_full"| "stock_volume-0"| "stock_volume-max"| "stock_volume-med"| "stock_volume-min"| "stock_volume-mute"| "stock_volume"| "stock_weather-cloudy"| "stock_weather-few-clouds"| "stock_weather-fog"| "stock_weather-night-clear"| "stock_weather-night-few-clouds"| "stock_weather-showers"| "stock_weather-snow"| "stock_weather-storm"| "stock_weather-sunny"| "sunny"| "task-due"| "task-past-due"| "trashcan_full"| "trophy-bronze"| "trophy-gold"| "trophy-silver"| "user-available"| "user-away"| "user-busy"| "user-idle"| "user-invisible"| "user-offline"| "user-trash-full"| "weather-clear-night"| "weather-clear"| "weather-few-clouds-night"| "weather-few-clouds"| "weather-fog"| "weather-overcast"| "weather-severe-alert"| "weather-showers"| "weather-showers-scattered"| "weather-snow"| "weather-storm"| "xfce-trash_full"
    | string ;
export declare type NotifySendUrgency= "low"|"medium"|"high"|"";
export declare type NotifySendCategory="device" | "device.added" | "device.error" | "device.removed" | "email" | "email.arrived" | "email.bounced" | "im" | "im.error" | "im.received" | "network" | "network.connected" | "network.disconnected" | "network.error" | "presence" | "presence.offline" | "presence.online" | "transfer" | "transfer.complete" | "transfer.error"|"";


/////////// +------------------------------------------------------------------------+
/////////// |          Type          |                  Description                  |
/////////// |------------------------+-----------------------------------------------|
/////////// | "device"               |   A generic device-related notification that  |
/////////// |                        | doesn't fit into any other category.          |
/////////// |------------------------+-----------------------------------------------|
/////////// | "device.added"         | A device, such as a USB device, was added to  |
/////////// |                        | the system.                                   |
/////////// |------------------------+-----------------------------------------------|
/////////// | "device.error"         | A device had some kind of error.              |
/////////// |------------------------+-----------------------------------------------|
/////////// | "device.removed"       |   A device, such as a USB device, was removed |
/////////// |                        | from the system.                              |
/////////// |------------------------+-----------------------------------------------|
/////////// | "email"                |   A generic e-mail-related notification that  |
/////////// |                        | doesn't fit into any other category.          |
/////////// |------------------------+-----------------------------------------------|
/////////// | "email.arrived"        | A new e-mail notification.                    |
/////////// |------------------------+-----------------------------------------------|
/////////// | "email.bounced"        | A notification stating that an e-mail has     |
/////////// |                        | bounced.                                      |
/////////// |------------------------+-----------------------------------------------|
/////////// |                        |   A generic instant message-related           |
/////////// | "im"                   | notification that doesn't fit into any other  |
/////////// |                        | category.                                     |
/////////// |------------------------+-----------------------------------------------|
/////////// | "im.error"             | An instant message error notification.        |
/////////// |------------------------+-----------------------------------------------|
/////////// | "im.received"          | A received instant message notification.      |
/////////// |------------------------+-----------------------------------------------|
/////////// | "network"              |   A generic network notification that doesn't |
/////////// |                        | fit into any other category.                  |
/////////// |------------------------+-----------------------------------------------|
/////////// |                        |   A network connection notification, such as  |
/////////// | "network.connected"    | successful sign-on to a network service. This |
/////////// |                        | should not be confused with device.added for  |
/////////// |                        | new network devices.                          |
/////////// |------------------------+-----------------------------------------------|
/////////// |                        |   A network disconnected notification. This   |
/////////// | "network.disconnected" | should not be confused with device.removed    |
/////////// |                        | for disconnected network devices.             |
/////////// |------------------------+-----------------------------------------------|
/////////// | "network.error"        |   A network-related or connection-related     |
/////////// |                        | error.                                        |
/////////// |------------------------+-----------------------------------------------|
/////////// |                        |   A generic presence change notification that |
/////////// | "presence"             | doesn't fit into any other category, such as  |
/////////// |                        | going away or idle.                           |
/////////// |------------------------+-----------------------------------------------|
/////////// | "presence.offline"     | An offline presence change notification.      |
/////////// |------------------------+-----------------------------------------------|
/////////// | "presence.online"      | An online presence change notification.       |
/////////// |------------------------+-----------------------------------------------|
/////////// |                        |   A generic file transfer or download         |
/////////// | "transfer"             | notification that doesn't fit into any other  |
/////////// |                        | category.                                     |
/////////// |------------------------+-----------------------------------------------|
/////////// | "transfer.complete"    | A file transfer or download complete          |
/////////// |                        | notification.                                 |
/////////// |------------------------+-----------------------------------------------|
/////////// | "transfer.error"       | A file transfer or download error.            |
/////////// +------------------------------------------------------------------------+