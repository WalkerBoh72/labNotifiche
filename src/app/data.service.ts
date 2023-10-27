import { Injectable } from '@angular/core';
import {
  PostgrestError,
  SupabaseClient,
  createClient,
} from '@supabase/supabase-js';
import { supabaseInit } from './initSupabase';
import { Observable, Subject, from, tap } from 'rxjs';
import { notifica } from './model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseInit.projectURL, supabaseInit.apiKey);
  }
  async getNotificheP(type: number): Promise<{
    notifiche: notifica[];
    error: PostgrestError | null;
  }> {
    let { data: t, error } = await this.supabase.from('notifiche')
      .select('*')
      .eq('id_type', type);

    if (error) {
      throw error;
    }
    const notifiche: notifica[] = t ? t : [];

    return { notifiche, error };
  }

  getNotifiche(type: number): Observable<{
    notifiche: any[];
    error: PostgrestError | null;
  }> {
    const observable$ = from(this.getNotificheP(type));
    return observable$
  }

  getFilialeChanges() {
    const changes = new Subject();

    this.supabase
      .channel('notify')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifiche', filter: 'id_type=eq.1' }, payload => {
        changes.next(payload);
        console.log('Change received! Filiale', payload)
      })
      .subscribe()

    return changes.asObservable()
  }

  getUffContrChanges() {
    const changes = new Subject();

    this.supabase
      .channel('notify')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifiche', filter: 'id_type=eq.0' }, payload => {
        changes.next(payload);
        console.log('Change received! contratti', payload)
      })
      .subscribe()

    return changes.asObservable()
  }



  async insertNotificaP(notifica: notifica): Promise<notifica> {
    // update
    const { data, error } = await this.supabase
      .from('notifiche')
      .insert(notifica)
      .select()
    if (error) {
      throw error;
    } else return data[0]

  }

  insertNotifica(notifica: notifica): Observable<notifica> {
    const observable$ = from(this.insertNotificaP(notifica));
    return observable$;
  }

  removeNotifica(notifica: notifica): Observable<boolean> {
    const observable$ = from(this.removeNotificaP(notifica));
    return observable$;
  }

  async removeNotificaP(notifica: notifica): Promise<boolean> {
    // update
    const { data, error } = await this.supabase
      .from('notifiche')
      .delete()
      .eq('id_type', 0)
      .eq('key1', notifica.key1)
    if (error) {
      throw error;
    } else return true

  }



  removeNotifiche(): Observable<boolean> {
    const observable$ = from(this.removeNotificheP());
    return observable$;
  }

  async removeNotificheP(): Promise<boolean> {
    // update
    const { data, error } = await this.supabase
      .from('notifiche')
      .delete()
      .eq('status', 0)
    if (error) {
      throw error;
    } else return true

  }
}
