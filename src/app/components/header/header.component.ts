import { Component, Input } from '@angular/core';
import { Users } from 'src/app/models/users';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Input() users: Users | null = null;
  @Input() newMessages: number = 0;
}
