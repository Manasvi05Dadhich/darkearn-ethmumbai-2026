type Props = {
  children: React.ReactNode
  variant?: "primary" | "outline"
}

export default function Button({ children, variant="primary"}:Props){

const base="px-6 py-3 text-sm font-semibold tracking-wide transition"

const style =
variant==="primary"
? "bg-neon text-black hover:opacity-90"
: "border border-neon text-neon hover:bg-neon hover:text-black"

return(
<button className={`${base} ${style}`}>
{children}
</button>
)

}