import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  isElectron: boolean = false;
  electronApp: any = null;
  content: Subject<string> = new Subject<string>();
  errorContent: Subject<Error> = new Subject<Error>();

  constructor(private zone: NgZone) { 
    this.isElectron = !!(window && window['process'] && window['process'].type);

    window['require']('fs');
    this.electronApp = window['require']('electron');

    this.electronApp.ipcRenderer.on('save-error', (event: unknown, data: Error) => {
      this.zone.run(() => {
        this.errorContent.next(data);
      });
    })

    this.electronApp.ipcRenderer.send('fetch-data', {});
  }

  saveTextToFile(input: string) {
    if (!this.isElectron) return;

    this.electronApp.ipcRenderer.send('save-data', input);
  }

  getContent(): Subject<string> {
    return this.content;
  }

  getErrorMessages(): Subject<Error> {
    return this.errorContent;
  }

  listenToIPCEvent() {
    if (!this.isElectron) {
      return;
    }

    this.electronApp.ipcRenderer.on('data-from-main', (event: unknown, data: string) => {
      this.zone.run(() => {
        this.content.next(data);
      });
    });  
  }

}
