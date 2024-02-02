import { Component, Input } from '@angular/core';
import { Users } from 'src/app/models/users';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  users$: Users | null = null;
  constructor(private authService: AuthService) {
    authService.users$.subscribe((data) => {
      this.users$ = data;
    });
  }
}
