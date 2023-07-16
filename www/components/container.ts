import { FunctionalWidget, StatefulWidget, StatelessWidget, statefulFunctionWidget, statelessFunctionWidget, useComponent } from "widgetsjs";

const isBool = (s: "true" | "false") => ({"true": true, "false": false}[s])

const parseTime = (time: string) => {
  let t = 0;
  let tmp = ""
  for(const char of time.split("")) {
    if (char == "h") {
      t += Number(tmp) * 60 * 60 * 1000
      tmp = ""
    } else if (char == "m") {
      t += Number(tmp) * 60 * 1000
      tmp = ""
    } else if (char == "s") {
      t += Number(tmp) * 1000
      tmp = ""
    } else {
      tmp += char
    }
  }

  return t
}

function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedTime = '';
  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `;
  }
  if (remainingSeconds > 0 || formattedTime === '') {
    formattedTime += `${remainingSeconds}s`;
  }

  return formattedTime;
}

function functionFromPlan(plan: any, updateCallback: any, doneCallback: any) {
  return () => {
    let mTime = parseTime(plan.duration)
    var int = setInterval(() => {
      mTime -= 1000
      updateCallback(plan, mTime)
      if (mTime == 0) {
        clearInterval(int);
        doneCallback();
      }
    }, 1000)
  }
}

function doSequentially(plans: any[], updateCallback: any) {
  console.log(plans)
  if (plans.length == 0) return;
  const p = plans.pop()

  functionFromPlan(p, updateCallback, () => {
    doSequentially(plans, updateCallback)
  })()
}

function runPromisesSequentially(promises: any) {
  return promises.reduce((chain: any, promise: any) => {
    return chain.then(() => promise);
  }, Promise.resolve());
}

const pinning = {
  "bottom": "position: fixed; bottom: 0;",
  "top-left": "position: fixed; top: 0; left:0;"
}

const Container: FunctionalWidget<StatelessWidget> = function () {

  this.onMount = () => {
    console.log(this.widgetChildren)
  }

  return (state) => `
    <div style="display: flex; justify-content: center; margin: 2rem;">
      <div style="
        display: flex;
        justify-content: center;
        background-color: #FFF9C8;
        ${state.bordered ? "border: 4px solid black;" : ""}
        ${state.shadowed ? "box-shadow: 4px 4px black;" : ""}
        padding: 1rem;
        ${state.fill ? "width: 100%;": "width: auto;"}
        font-family: 'Lexend', sans-serif;
        ${state.squeeze ? "max-width: "+state.squeeze+";": ""}
        ${pinning[state.pinned as 'bottom' | 'top-left'] || ""}
      ">
        ${this.widgetChildren}
      </div>
    </div>
  `
}

const GetStartedOrPlanListContainer: FunctionalWidget<StatefulWidget> = function name() {

  this.onMount = () => {
    const btn: any = this.children[0]
    fetch("/plans").then(r => r.json()).then(d => {
      const planHashes = Object.getOwnPropertyNames(d)
      
      if (planHashes.length > 0) btn.setState({text: "ADD PLAN"});

      for (const hash of planHashes) {
        const plan: any = document.createElement("managed-plan")
        plan.setState({...d[hash], id: hash})
        this.appendChild(plan)
      }
    })
  }

  return (state) => "<managed-gsbutton action=positive-action size=normal centred=true>GET STARTED</managed-gsbutton>";
}

const OverlayContainer: FunctionalWidget<StatefulWidget> = function () {
  this.onMount = () => {
    const url = new URL(window.location.href)
    const ref = url.hash.split("?")[0];
    const existingPlanId = url.searchParams.get("plan")

    let [_, path] = ref.split("#");
    path = path || "/";

    if (path == "/overlay") document.body.style.background = "transparent";

    if (!existingPlanId) return;
    fetch("/plan/"+existingPlanId).then(r => r.json()).then(d => {
      const root = d.plans[0]
      const rest = d.plans.slice()

      this.setState({
        name: root.name,
        time: formatTime(parseTime(root.duration))
      })

      doSequentially(d.plans.reverse(), (p: any, t: number) => {
        this.setState({
          name: p.name,
          time: formatTime(t)
        })
      })

      console.log(d, parseTime("2m30s"), formatTime(150000))
    })
  }

  return (state: any) => `
    <div style="
      width: 1000px;
      height: 200px;
      background-color: #FFF9C8;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: 1fr;
      grid-column-gap: 0px;
      grid-row-gap: 0px;
      font-size: 4rem;
      padding: 0 2rem;
      border: 1rem solid black;
    ">
      <div style="grid-area: 1 / 1 / 2 / 5;"><p id="name">${state.name}</p></div>
      <div style="grid-area: 1 / 5 / 2 / 6;"><p id="time">${state.time}</p></div>
    </div>
  `
}

useComponent(statelessFunctionWidget(Container, {pinned: "", bordered: true, shadowed: true, fill: false}, {bordered: isBool, shadowed: isBool, fill: isBool})).as('managed-container');
useComponent(statefulFunctionWidget(GetStartedOrPlanListContainer, {list: undefined})).as('managed-gsorlist');
useComponent(statefulFunctionWidget(OverlayContainer)).as("managed-ovcontainer");