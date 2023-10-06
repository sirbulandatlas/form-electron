import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElectronService } from './ipc/electron.service';
import { Error } from 'src/interfaces/Error';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
        })
      ),
      transition('void <=> *', animate('300ms')),
    ]),
  ],
})
export class AppComponent implements OnInit {
  savedContent: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  fileSaveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private electronService: ElectronService
  ) {
    this.fileSaveForm = this.fb.group({
      inputText: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.electronService.listenToIPCEvent();

    this.electronService.getErrorMessages().subscribe((content: Error) => {
      if (content.code !== 'ENOENT') {
        this.errorMessage = content.message || '';
      }

      this.savedContent = '';
      this.isLoading = false;
    });

    this.electronService.getContent().subscribe((content) => {
      this.savedContent = content;
      this.isLoading = false;
    });
  }

  saveTextToFile() {
    if (this.fileSaveForm.invalid) {
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.electronService.saveTextToFile(this.fileSaveForm.value.inputText)
    this.fileSaveForm.reset();
  }
}
