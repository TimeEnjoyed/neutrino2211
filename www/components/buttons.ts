import { useComponent } from "widgetsjs";
import { Button } from "./button";
import { InputList } from "./plan-input";

class GetStartedButton extends Button<{}> {
  constructor(){
    super({}, {})
  }

  onClick(): void {
    window.open("/#/create", "_self")
  }
}

export class SaveButton extends Button<{isSave: boolean, isEdit: boolean}> {
  constructor() {
    super({isEdit: false, isSave: true}, {});
  }

  async onClick(): Promise<void> {
    const planList = this.$ref<InputList>("planList")
    const plans = planList.getPlans()

    const title = document.querySelector("#plan-name-header");

    console.log(plans)

    const url = new URL(window.location.href)
    const existingPlanId = url.searchParams.get("plan")
    console.log(existingPlanId, url.searchParams)

    const planPath = existingPlanId ? "/plan/"+existingPlanId : "/plan"

    const {id} = await fetch(planPath, {
      method: "POST",
      body: JSON.stringify({title: title?.textContent, plans}),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(r => r.json())

    alert(`
      SAVED!!

      Your overlay is at /?plan=${id}/#/overlay
    `)
  }

  onMount(): void {
    super.onMount()
    this.setState({text: "SAVE"})
  }
}

export class AddButton extends Button<{isAdd: boolean, isDelete: boolean}> {
  constructor() {
    super({isAdd: true, isDelete: false}, {});
  }

  shouldDelete: number | undefined = undefined;

  onClick(): void {
    const planList = this.$ref<InputList>("planList")
    planList.addPlan()
  }

  onMount(): void {
    super.onMount();
    this.setState({text: "ADD"})
  }
}

export class DeleteButton extends Button<{shouldDelete: number | undefined, disabled: boolean}> {
  constructor() {
    super({shouldDelete: undefined, disabled: true}, {});
  }

  onClick(): void {
    const planList = this.$ref<InputList>("planList")
    console.log(this.state.shouldDelete)
    planList.deletePlan(this.state.shouldDelete)
  }

  readyDelete(id: number | undefined) {
    console.log(id)
    this.setState({shouldDelete: id, disabled: id == undefined})
  }

  onMount(): void {
    super.onMount();
    this.setState({text: "DELETE"})
  }
}

export class PlanDeleteButton extends Button<{shouldDelete: number | undefined, disabled: boolean}> {
  constructor() {
    super({shouldDelete: undefined, disabled: false}, {});
  }

  plan: HTMLElement | undefined = undefined

  onClick(): void {
    if (this.plan) this.plan.remove();
  }

  onMount(): void {
    super.onMount();
    this.setState({text: "DELETE"})
  }
}

export class HomeButton extends Button<{}> {
  constructor() {
    super({}, {})
  }

  onMount(): void {
    super.onMount();
    window.addEventListener("hashchange", () => {
      const url = new URL(window.location.toString())
      const ref = url.hash.split("?")[0];
      let [_, path] = ref.split("#");
      path = path || "/";

      this.setState({disabled: path == "/"})
      if (path == "/overlay") this.remove()
    })
  }

  onClick(): void {
    window.open("/", "_self")
  }
}

export class OverlayButton extends Button<{}> {
  constructor() {
    super({}, {})
  }

  onClick(): void {
    alert(this.state.overlayurl)
  }
}

useComponent(GetStartedButton).as("managed-gsbutton")
useComponent(DeleteButton).as("managed-debutton")
useComponent(SaveButton).as("managed-sebutton")
useComponent(AddButton).as("managed-adbutton")
useComponent(HomeButton).as("managed-homebutton")
useComponent(PlanDeleteButton).as("managed-pdebutton")
useComponent(OverlayButton).as("managed-olbutton")
