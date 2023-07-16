import { FunctionalWidget, StatefulWidget, statelessFunctionWidget, useComponent } from "widgetsjs";

const buttonColors = {
  'positive-action': "background-color: #CCFFC8;",
  'negative-action': "background-color: #FFC8C8;",
  'neutral-action': "background-color: #C8CAFF;"
}

const buttonSizes = {
  'small': 'padding: 10px 15px; font-size: 1.2rem;',
  'normal': 'padding: 15px 10px; font-size: 1.5rem;',
  'large': 'padding: 25px 20px; font-size: 2rem;'
}

type ButtonState = {
  action: 'positive-action' | 'negative-action' | 'neutral-action',
  size: 'normal' | 'large',
  centred: boolean,
  inline: boolean,
  disabled: boolean,
}

export class Button<T> extends StatefulWidget {
  constructor(defaultState: T, transformers: any) {
    super({...defaultState}, {centered: Boolean, inline: Boolean, ...transformers})
  }

  text: string = "";

  onClick(): void {}

  onMount(){
    const btn = this.$child<HTMLButtonElement>("button");

    if(!btn) return

    btn.addEventListener("mouseover", () => {
      btn.style.boxShadow = "10px 10px black"
      btn.style.transform = "translate(-2px, -2px)"
    })

    btn.addEventListener("mouseout", () => {
      btn.style.boxShadow = "4px 4px black"
      btn.style.transform = "translate(2px, 2px)"
    })

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      this.onClick();
    })
  }
  
  render = (state: ButtonState) => `
    <div style=\"${state.centred ? "display: flex; justify-content: center;" : ""} ${state.inline ? "display: inline-block; padding: 0px 5px;" : "padding: 0px 5px;"}\">
      <button ${state.disabled ? "disabled=true": ""} style="
        ${buttonColors[state.action] || ""};
        ${buttonSizes[state.size] || ""};
        border: solid 4px black;
        border-radius: 4px;
        font-family: 'Lexend', sans-serif;
        box-shadow: 4px 4px black;
        cursor: pointer;
        ${state.centred ? "margin: auto;" : ""}
      ">${this.state.text || this.widgetChildren}</button>
    </div>
  `
}
