import Button from "../ui/Button"

export default function Navbar(){

return(

<nav className="w-full flex items-center justify-between px-10 py-5 border-b border-white/5">

<div className="flex items-center gap-2 text-neon font-semibold tracking-wider">
<span>🛡</span>
<span>DARKEARN</span>
</div>

<Button>
CONNECT WALLET
</Button>

</nav>

)

}