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
  async getNotificheP(type: number, cdff?: string): Promise<{
    notifiche: notifica[];
    error: PostgrestError | null;
  }> {
    let query = this.supabase
      .from('notifiche')
      .select('*')
      .in('id_type', type == 0 ? [0, 2] : [1, 3]);

    if (cdff) {
      query = query.eq('key2', cdff);
    }

    let { data: t, error } = await query;

    if (error) {
      throw error;
    }
    const notifiche: notifica[] = t ? t : [];

    return { notifiche, error };
  }

  getNotifiche(type: number, cdff?: string): Observable<{
    notifiche: any[];
    error: PostgrestError | null;
  }> {
    const observable$ = from(this.getNotificheP(type, cdff));
    return observable$
  }

  getFilialeChanges() {
    const changes = new Subject();

    this.supabase
      .channel('notify')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifiche', filter: 'id_type=in.(1, 3)' }, payload => {
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifiche', filter: 'id_type=in.(0, 2)' }, payload => {
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
      .eq('id_type', notifica.id_type)
      .eq('key1', notifica.key1)
      .eq('key2', notifica.key2)
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
