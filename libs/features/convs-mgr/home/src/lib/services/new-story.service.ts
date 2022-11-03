import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";
import { take, map, switchMap, tap } from "rxjs/operators";

import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";

import { Story } from "@app/model/convs-mgr/stories/main";

import { ActiveOrgStore } from "@app/state/organisation";
import { StoriesStore } from "@app/state/convs-mgr/stories";
import { ToastService } from "@iote/bricks-angular";
import { TranslateService } from "@ngfi/multi-lang";


/** Service which can create new stories. */
@Injectable()
export class NewStoryService
{
  constructor(private _org$$: ActiveOrgStore,
              private _stories$$: StoriesStore,
              private _router: Router,
              private _toastService: ToastService,
              private _translate: TranslateService,
              private dialog: MatDialog)
  {}

  add(name?: string, description?: string) {
    // Generate default name if name not passed.
    if(!name)
      name = this.generateName();

    return this._getOrgId$()
               .pipe(
                switchMap((orgId) =>
                  this._stories$$.add({ name: name as string, orgId, description } as Story)),
                tap((s: Story) => {
                  this.dialog.closeAll()
                  this._router.navigate(['/stories', s.id])
                }
                ))


  }

  update(story: Story) {
    this._stories$$.update(story).subscribe(() => {
      try {
        this.dialog.closeAll();
        this._toastService.doSimpleToast(this._translate.translate('TOAST.EDIT-BOT.SUCCESSFUL'));
      } catch (error) {
        this._toastService.doSimpleToast(this._translate.translate('TOAST.EDIT-BOT.FAIL'));
      }
    });
  }

  private _getOrgId$ = () => this._org$$.get().pipe(take(1), map(o => o.id));

  generateName(){
    const defaultName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
    return defaultName;
  }
}
