import { combineLatest, debounceTime, map, mergeMap, Observable, of, share, startWith } from "rxjs";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl } from "@angular/forms";

interface Plugin {
  fn: (...value: string[]) => unknown
  hint?: string
  input?: string
}

@Component({
  selector: "slash-command-concept-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  public readonly input = new FormControl()
  public readonly chat = new FormControl('')

  // future extendable: could be configured from settings and async.
  private readonly triggerKey$ = of('/')

  // future extendable: could be configured from settings and async.
  public readonly registeredPlugins$: Observable<Record<string, Plugin>> = of({
    giphy: { hint: '[search]', description: 'TODO', fn: () => 'please setup giphy' },
    add: { hint: '[num] [num]', description: 'TODO', fn: (...val: string[]) => val.map(b => parseInt(b)).filter(b => !isNaN(b)).reduce((acc, curr) => acc ? acc + curr : curr, 0) },
    sub: { hint: '[num] [num]', description: 'TODO', fn: (...val: string[]) => val.map(b => parseInt(b)).filter(b => !isNaN(b)).reduce((acc, curr) => acc ? acc - curr : curr, 0) },
    div: { hint: '[num] [num]', description: 'TODO', fn: (...val: string[]) => val.map(b => parseInt(b)).filter(b => !isNaN(b)).reduce((acc, curr) => acc ? acc / curr : curr, 0) },
    mul: { hint: '[num] [num]', description: 'TODO', fn: (...val: string[]) => val.map(b => parseInt(b)).filter(b => !isNaN(b)).reduce((acc, curr) => acc ? acc * curr : curr, 0) },
    addcommand: { description: '', fn: () => alert('addcommand not implemented') }
  }).pipe(share())

  private readonly triggerStrings$ = combineLatest([this.registeredPlugins$, this.triggerKey$]).pipe(
    map(([plugins, triggerKey]) => [triggerKey, ...Object.keys(plugins).map(key => `${triggerKey}${key} `)])
  )
  private readonly inputValueChanges$: Observable<string> = this.input.valueChanges.pipe(startWith(''), share())

  public readonly shownPlugins$ = this.inputValueChanges$.pipe(
    debounceTime(0),
    mergeMap(txt => this.triggerStrings$.pipe(
      map(b => txt === ''
        ? []
        : txt === b[0]
          ? b.slice(1)
          : b.filter(c => txt[0] === c[0] && (
            c.toLowerCase().includes(txt.toLowerCase()) ||
            (txt.toLowerCase().includes(c.toLowerCase()))
          )).slice(1)
      ),
    )),
    mergeMap(keys => this.registeredPlugins$.pipe(
      map(pluginsObj => keys
        .map(a => a.trim())
        .map(name => ({ ...pluginsObj[name.slice(1)], name, inputValue: this.input.value.slice(this.input.value.indexOf(" ")).split(" ") })))
    ))
  )

  submit(fc: FormControl, plugin: Plugin): void {
    const value = fc.value as string

    if (!value || value === '' || value === null) return

    const valueToSet = plugin ? plugin.fn(...value.split(" ").slice(1)) : value

    this.chat.setValue(this.chat.value + "\n" + "user1: " + valueToSet)
    fc.setValue('')
  }

}
