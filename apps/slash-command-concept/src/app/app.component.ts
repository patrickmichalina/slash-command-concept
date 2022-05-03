import { combineLatest, debounceTime, map, mergeMap, Observable, of, share } from "rxjs";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl } from "@angular/forms";

interface Plugin {
  fn: () => void
  hint?: string
}

@Component({
  selector: "slash-command-concept-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  public readonly input = new FormControl()

  // future extendable: could be configured from settings and async.
  private readonly triggerKey$ = of('/')

  // future extendable: could be configured from settings and async.
  public readonly registeredPlugins$: Observable<Record<string, Plugin>> = of({
    giphy: { hint: '[search]', description: '', fn: () => alert('giphy not implemented') },
    add: { hint: '[number] [num]', description: '', fn: () => alert('add not implemented') },
    sub: { hint: '[number] [num]', description: '', fn: () => alert('subtract not implemented') },
    div: { hint: '[number] [num]', description: '', fn: () => alert('divide not implemented') },
    mul: { hint: '[number] [num]', description: '', fn: () => alert('multiply not implemented') },
    addcommand: { description: '', fn: () => alert('addcommand not implemented') }
  }).pipe(share())

  private readonly triggerStrings$ = combineLatest([this.registeredPlugins$, this.triggerKey$]).pipe(
    map(([plugins, triggerKey]) => [triggerKey, ...Object.keys(plugins).map(key => `${triggerKey}${key} `)])
  )
  private readonly inputValueChanges$: Observable<string> = this.input.valueChanges.pipe(share())

  public readonly shownPlugins$ = this.inputValueChanges$.pipe(
    debounceTime(0),
    mergeMap(txt => this.triggerStrings$.pipe(
      map(b => txt === ''
        ? []
        : txt === b[0]
          ? b.slice(1)
          : b.filter(c => txt[0] === c[0] && c.toLowerCase().includes(txt.toLowerCase().substring(0, txt.indexOf("  "))))),
    )),
    mergeMap(keys => this.registeredPlugins$.pipe(map(pluginsObj => keys.map(a => a.trim()).map(name => {
      console.log(pluginsObj[name.slice(1)])
      return {
        ...pluginsObj[name.slice(1)],
        name
      }
    }))))
  )



}
