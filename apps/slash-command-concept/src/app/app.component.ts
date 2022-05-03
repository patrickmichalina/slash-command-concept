import { combineLatest, debounceTime, map, mergeMap, Observable, of, share } from "rxjs";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl } from "@angular/forms";

interface Plugin {
  fn: (value?: string) => void
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
    giphy: { hint: '[search]', description: 'TODO', fn: () => alert('giphy not implemented') },
    add: { hint: '[num] [num]', description: 'TODO', fn: (val?: string) => alert(val + 'add not implemented') },
    sub: { hint: '[num] [num]', description: 'TODO', fn: () => alert('subtract not implemented') },
    div: { hint: '[num] [num]', description: 'TODO', fn: () => alert('divide not implemented') },
    mul: { hint: '[num] [num]', description: 'TODO', fn: () => alert('multiply not implemented') },
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
          : b.filter(c => txt[0] === c[0] && c.toLowerCase().includes(txt.toLowerCase()))),
    )),
    mergeMap(keys => this.registeredPlugins$.pipe(
      map(pluginsObj => keys
        .map(a => a.trim())
        .map(name => ({ ...pluginsObj[name.slice(1)], name, inputValue: this.input.value.slice(this.input.value.indexOf(" ")) })))
    ))
  )

  submit(fc: FormControl): void {
    const value = fc.value
    if (!value || value === '' || value === null) return
    this.chat.setValue(this.chat.value + "\n" + "user1: " + value)
    fc.setValue('')
  }

}
