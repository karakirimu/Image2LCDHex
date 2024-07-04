import { Button } from "@nextui-org/react";
import {useTheme} from "next-themes";
import { MdLightMode, MdDarkMode } from "react-icons/md" 

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()

  const nextTheme = theme === 'light' ? 'dark' : 'light'
  const iconSelect = (v?: string) => {
    if(typeof v === "undefined"){
      setTheme('light')
      return(<MdLightMode/>)
    }

    if(theme === 'light'){
      return (<MdLightMode/>)
    }

    return (<MdDarkMode/>)
  }

  return (
    <Button isIconOnly variant="light" radius="full" title={theme} onClick={() => setTheme(nextTheme)}>
      {iconSelect(theme)}
    </Button>
  )
};