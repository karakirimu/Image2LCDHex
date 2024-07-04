import { Button, Navbar, NavbarBrand, NavbarContent, Spacer } from "@nextui-org/react";
import { useContext, useEffect, useState } from "react";
import Panel, { PanelProps } from "./Panel";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { AppContext, Operation, PanelOperation } from "./AppContextProvider";
import { GrGithub } from "react-icons/gr"
import { HiPlus } from "react-icons/hi"

function App() {     
  const c = useContext(AppContext)
  const [panel, setPanel] = useState(<></>)
  console.log("app.call")

  const handleAdd = () => {
    console.log("handleAdd.call")
    const prop : PanelProps = {
      hex: "",
      direction: "Vertical",
      width: 128,
      height: 64,
      delimiter: ",",
      invert: false,
      otsuMethod: true,
      id: crypto.randomUUID()
    }
    c.context.set({operation: Operation.Add, panel: {id: prop.id, operation: PanelOperation.New, value: prop}})
  }

  useEffect(() => {

    const createPanel = () => {
      // console.log("panel.call")
      const d = c.context.get
      const result = Array.from(d.panel.values()).map((v) => {
        return (
          <div key={v.id} className="w-full p-4">
            <Panel key={v.id} {...v} />
          </div>
        )
      })

      if(result.length === 0){
        result.push(
        <div key="no_item">
          <Spacer y={8}/>
          <span className="text-neutral-400 text-2xl">There are no items. Please press this </span>
          <Button isIconOnly title="Add" color="primary" className="text-lg font-bold" radius="full" onClick={handleAdd}><HiPlus/></Button>
          <span className="text-neutral-400 text-2xl">.</span>
        </div>
        )
      }
  
      return result
    }

    setPanel(<>{createPanel()}</>)
  },[c.context.get, c.context.get.panel.size])

  const openUrl = () => {
    window.open("https://github.com/karakirimu/Image2LCDHex", "_blank")
  }

  return (<>
    <Navbar isBordered isBlurred position="static">
      <NavbarBrand>
        <p className="font-bold text-inherit">Image -> LCD Hex</p>
      </NavbarBrand>
      <NavbarContent justify="end">
        <Button isIconOnly title="GitHub" variant="light" className="text-lg font-bold" radius="full" onClick={openUrl}><GrGithub/></Button>
        <ThemeSwitcher />
        <Button isIconOnly title="Add" color="primary" className="text-lg font-bold" radius="full" onClick={handleAdd}><HiPlus/></Button>
      </NavbarContent>
    </Navbar>
    <div className="container mx-auto max-w-5xl">
      <div className="flex flex-wrap justify-center">
        {panel}
      </div>
    </div>
  </>);
}

export default App
