import { StatefulWidget, useComponent } from "widgetsjs";
import { AddButton, DeleteButton } from "./buttons";

type Plan = {
  id: number;
  name: string;
  duration: string;
}

type PlanListState = {
  plans: Plan[]
}

export class InputList extends StatefulWidget {
  constructor() {
    super({})
  }

  addPlan() {
    const thisDiv = this.$child<HTMLDivElement>("div");
    const newPlanInput = new PlanInput()
    newPlanInput.state = {...newPlanInput.state, planid: thisDiv.children.length}

    thisDiv.appendChild(newPlanInput)
  }

  deletePlan(id: number) {
    const thisDiv = this.$child<HTMLDivElement>("div");
    thisDiv.children[id].remove()

    // Reset the plan IDs
    for(const child in Array.from(thisDiv.children)) {
      console.log(child);
      (thisDiv.children[child] as PlanInput).setState({planid: child})
    }
  }

  getPlans() {
    const thisDiv = this.$child<HTMLDivElement>("div");
    return Array.from(thisDiv.children).map((e: any) => e.state)
  }

  onMount(): void {
    const url = new URL(window.location.href)
    const existingPlanId = url.searchParams.get("plan")

    if (!existingPlanId) return;

    fetch("/plan/"+existingPlanId).then(r => r.json()).then(d => {
      const header = document.getElementById("plan-name-header")
      if (header) {
        header.textContent = d.title;
      }

      const thisDiv = this.$child<HTMLDivElement>("div");
      for(const child of Array.from(thisDiv.children)) {
        child.remove()
      }

      for(const plan of d.plans) {
        const newPlanInput = new PlanInput()
        newPlanInput.setState({...plan})

        thisDiv.appendChild(newPlanInput)
      }

    })
  }

  render(state: PlanListState) {
    const html = `
      <div style="padding-bottom: 50px;">
        <managed-planinput planid="0" name="" duration=""></managed-planinput>
      </div>
    `;
    console.log(state, html)
    return html
  }
}

class PlanInput extends StatefulWidget {
  constructor() {
    super({
      planid: 0,
      name: "",
      duration: ""
    }, {planid: Number})
  }

  onMount(): void {
    const deButton = this.$ref<DeleteButton>("debutton");
    const whatInput = this.$child<HTMLInputElement>("#plan-"+this.state.planid);
    const howLongInput = this.$child<HTMLInputElement>("#plan-time-"+this.state.planid);

    console.log(whatInput, howLongInput, "#plan-"+this.state.planid, "#plan-time-"+this.state.planid, this.state.planid)

    const readyDelete = () => {
      deButton.readyDelete(this.state.planid)
    }

    const undoReadyDelete = () => {
      setTimeout(() => deButton.readyDelete(undefined), 200); // Delay unsetting so the Delete button gets the actual ID
    }

    whatInput.addEventListener("focusin", readyDelete)
    howLongInput.addEventListener("focusin", readyDelete)
    whatInput.addEventListener("focusout", undoReadyDelete)
    howLongInput.addEventListener("focusout", undoReadyDelete)


    whatInput.addEventListener('keyup', () => {
      this.setState({name: whatInput.value})
    })

    howLongInput.addEventListener('keyup', () => {
      this.setState({duration: howLongInput.value})
    })
  }

  render(state: any): string {
    return `
      <div style="max-width: 700px; margin: 10px auto; justify: center;">
        <div class="input-holder" style="width: 70%;min-width: 50px;">
          <label style="${state.planid > 0 ? "visibility: hidden;" : ""}" for="plan-${state.planid}">What are we working on?</label>
          <input style="width: 100%;" type="text" placeholder="Working on..." id="plan-${state.planid}" value="${state.name}"/>
        </div>
        <div class="input-holder" style="width: 25%;min-width: 50px;">
          <label style="${state.planid > 0 ? "visibility: hidden;" : ""}" for="plan-time-${state.planid}">For how long?</label>
          <input style="width: 100%;" type="text" placeholder="1h1m1s" id="plan-time-${state.planid}" value="${state.duration}"/>
        </div>
      </div>
    `;
  }
}

export class PlanLink extends StatefulWidget {
  constructor() {
    super({})
  }

  onMount(): void {
    const btn: any = this.$child("managed-pdebutton");

    if (btn) {
      btn.plan = this;
    }
  }

  remove(): void {
    super.remove()
    fetch("/plan/"+this.state.id, {
      method: "DELETE"
    }).then(r => r.json()).then(console.log)
  }

  render = (state: any) => `
    <div style="display: flex; justify-content: center;">
      <managed-container style="width: 500px" fill="true">
        <a style="text-decoration: none; color: black;" href="?plan=${state.id}/#/create">${state.title}</a>
      </managed-container>
      <span></span>
      <managed-pdebutton style="margin-top: 2rem" action=negative-action size=small inline=true>DELETE</managed-pdebutton>
      <managed-olbutton overlayurl="?plan=${state.id}/#/overlay" style="margin-top: 2rem" action=neutral-action size=small inline=true>OVERLAY</managed-olbutton>
    </div>
  `;
}

useComponent(InputList).as("managed-planlist");
useComponent(PlanInput).as("managed-planinput");
useComponent(PlanLink).as("managed-plan");
