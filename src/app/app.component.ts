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

    this.service.getFilialeChanges()
      .subscribe((payload) => {
        const { eventType, schema, table, old: oldRecord, new: newRecord } = payload;
        // Converti newRecord in un oggetto del tipo notifica
        const newRec: notifica = newRecord as notifica;
        const oldRec: notifica = oldRecord as notifica;
        switch (eventType) {
          case 'INSERT':
            this.lista = [...this.lista, newRec]
            break;
          case 'UPDATE':
            this.lista = this.lista.map(n => n.id == oldRec.id ? newRec : { ...n });
            break;
          case 'DELETE':
            this.lista = this.lista.filter(n => n.id !== oldRec.id);
            break;
          default:
            break;
        }
      });

    /* this.service.getFilialeChanges().pipe(
      switchMap(() => this.service.getNotifiche(1, this.cdff))
    ).subscribe((res) => this.lista = res.notifiche); */
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

  checkR(doc: number) {
    const not = {
      id_type: doc,
      messaggio: 'richiesta approvazione ' + (doc == 0 ? 'preventivo' : 'contratto'),
      status: 0,
      username: 'pippo',
      key1: this.counter,
      key2: this.cdff
    }
    this.service.insertNotifica(not).subscribe();
    this.counter += 1;
  }

  checkA(n: notifica) {
    console.log(n);
    const not = {
      id_type: n.id_type == 0 ? 1 : 3,
      messaggio: (n.id_type == 0 ? 'Preventivo' : 'Contratto') + ' approvato',
      status: 0,
      username: 'paperino',
      key1: n.key1,
      key2: n.key2
    }
    this.service.insertNotifica(not).subscribe()
    this.service.removeNotifica(n)
  }

  clear() { this.service.removeNotifiche(); }
}
