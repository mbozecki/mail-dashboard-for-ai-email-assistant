import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { ApiService, AskResponse } from '../../core/services/api.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: AskResponse['sources'];
  loading?: boolean;
}

@Component({
  selector: 'app-rag-playground',
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SkeletonModule],
  templateUrl: './rag-playground.component.html',
  styleUrl: './rag-playground.component.scss',
})
export class RagPlaygroundComponent implements AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  messages = signal<ChatMessage[]>([]);
  question = '';
  sending = signal(false);
  private shouldScroll = false;

  constructor(private api: ApiService) {}

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      const el = this.chatContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  send() {
    const q = this.question.trim();
    if (!q || this.sending()) return;
    this.question = '';
    this.sending.set(true);
    this.shouldScroll = true;
    this.messages.update(m => [...m, { role: 'user', content: q }]);
    this.messages.update(m => [...m, { role: 'assistant', content: '', loading: true }]);

    this.api.ask(q).subscribe({
      next: res => {
        this.messages.update(m => {
          const updated = [...m];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: res.answer,
            sources: res.sources,
            loading: false,
          };
          return updated;
        });
        this.sending.set(false);
        this.shouldScroll = true;
      },
      error: () => {
        this.messages.update(m => {
          const updated = [...m];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Coś poszło nie tak. Spróbuj ponownie.',
            loading: false,
          };
          return updated;
        });
        this.sending.set(false);
        this.shouldScroll = true;
      },
    });
  }
}