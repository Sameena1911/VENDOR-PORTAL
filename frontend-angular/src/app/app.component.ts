import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Vendor Portal</h1>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .app-header h1 {
      margin: 0;
      color: white;
      font-size: 2.5rem;
      font-weight: 300;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .app-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
  `]
})
export class AppComponent {
  title = 'vendor-portal-frontend';
}
