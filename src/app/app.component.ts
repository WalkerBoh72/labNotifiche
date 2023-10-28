import { Component } from '@angular/core';
import { DataService } from './data.service';
import { notifica } from './model';
import { of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  title = 'labNotifiche';
  role: 'Filiale' | 'Sede' | null = null;
  cdff: string = '';
  counter: number = 1;
  lista: notifica[] = [];

  constructor(private service: DataService) { }

  ngOnInit(): void {
  }

  onFiliale() {
    this.role = 'Filiale';
    this.getFiliale();

    this.service.getFilialeChanges().pipe(
      switchMap(() => this.service.getNotifiche(1, this.cdff))
    ).subscribe((res) => this.lista = res.notifiche);
  }

  onSede() {
    this.role = 'Sede';
    this.getUC();

    this.service.getUffContrChanges().pipe(
      switchMap(() => this.service.getNotifiche(0))
    ).subscribe((res) => this.lista = res.notifiche);
  }

  getFiliale() { this.service.getNotifiche(1, this.cdff).subscribe(res => this.lista = res.notifiche); }
  getUC() { this.service.getNotifiche(0).subscribe(res => this.lista = res.notifiche); }

  checkR() {
    const not = {
      id_type: 0,
      messaggio: 'richiesta approvazione',
      status: 0,
      username: 'pippo',
      key1: this.counter,
      key2: this.cdff
    }
    this.service.insertNotifica(not).subscribe();
    this.counter += 1;
  }

  checkA(n: notifica) {
    const not = {
      id_type: 1,
      messaggio: 'richiesta approvata',
      status: 0,
      username: 'paperino',
      key1: n.key1,
      key2: n.key2
    }
    this.service.insertNotifica(not).subscribe()
    this.service.removeNotifica({ ...not, id_type: 0 })
  }

  clear() { this.service.removeNotifiche(); }
}
