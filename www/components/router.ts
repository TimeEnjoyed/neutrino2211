import { FunctionalWidget, StatefulWidget,StatelessWidget , statefulFunctionWidget, useComponent } from "widgetsjs";

const routerSlots: {[key: string]: RouterSlot} = {};

class Router extends StatefulWidget {
  constructor(){
    super({})
  }

  updateRoutes() {
    // alert(window.location.toString() + " " + window.location.hash)
    const url = new URL(window.location.toString())
    const ref = url.hash.split("?")[0];
    let [_, path] = ref.split("#");
    path = path || "/";
    
    for (const s of Object.getOwnPropertyNames(routerSlots)) {
      if (s != path) {
        routerSlots[s].style.visibility = "hidden";
        routerSlots[s].style.position = "absolute";
      } else {
        routerSlots[s].style.visibility = "visible";
        routerSlots[s].style.position = "relative";
      }
    }
  }

  onMount() {
    window.addEventListener("hashchange", this.updateRoutes)
    this.updateRoutes()
  }

  render = () => this.widgetChildren;
}

class RouterSlot extends StatefulWidget {
  constructor() {
    super({active: false}, {active: Boolean, default: Boolean})
    this.style.position = "relative";
    this.style.height = "100%";
  }

  onMount(): void {
    const path = this.getAttribute("path")

    if (path) {
      routerSlots[path] = this;
    }
  }

  afterRender(): void {
    routerSlots[this.state.path] = this;
    const router = this.$ref<Router>("router")
    router.updateRoutes();
  }

  render(state: any): string {
    return this.widgetChildren;
  }
}

useComponent(Router).as("managed-router");
useComponent(RouterSlot).as("managed-router-slot");