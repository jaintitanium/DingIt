import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PostgrestError } from '@supabase/supabase-js';

@Component({
  selector: 'app-loading-error-block',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './loading-error-block.component.html',
  styleUrl: './loading-error-block.component.scss'
})
export class LoadingErrorBlockComponent {
  @Input('data') data: any;
  @Input('error') error?: PostgrestError | null;

}
