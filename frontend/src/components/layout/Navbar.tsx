import Button from "../ui/Button"
import logo from "../assets/logo.png"

export default function Navbar(){

return(

<nav className="w-full flex items-center justify-between px-10 py-5 border-b border-white/5">

<div className="flex items-center gap-2">
<img src={logo} alt="DarkEarn Logo" className="h-8 w-auto" />
</div>

<Button>
CONNECT WALLET
</Button>

</nav>

)

}