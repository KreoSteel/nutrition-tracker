import { ChefHat } from "lucide-react";
import { ModeToggle } from "./ThemeSwitcher";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-border mb-10">
      <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-10 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center gap-2 text-primary">
          <ChefHat size={30} />
          <h2>NutriTrack</h2>
        </div>
        <nav className="justify-self-center">
            <ul className="flex items-center gap-8 text-muted-foreground font-semibold">
                <li className="transition-colors hover:text-primary"><Link href="/">Dashboard</Link></li>
                <li className="transition-colors hover:text-primary"><Link href="/recipes">Recipes</Link></li>
                <li className="transition-colors hover:text-primary"><Link href="/ingredients">Ingredients</Link></li>
                <li className="transition-colors hover:text-primary"><Link href="/history">History</Link></li>
            </ul>
        </nav>
        <div className="justify-self-end">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
