import { Chewy, Nunito } from "next/font/google";
import PlayClient from "@/components/play/PlayClient";

const chewy = Chewy({ weight: "400", subsets: ["latin"], variable: "--font-chewy" });
const nunito = Nunito({ weight: ["500", "700", "800"], subsets: ["latin"], variable: "--font-nunito" });

export const metadata = {
  title: "Imp's High Street",
  description: "A little walkable town where every building is a Design Imp client, service or way to get in touch.",
};

export default function PlayPage() {
  return <PlayClient fontClass={`${chewy.variable} ${nunito.variable}`} signFont={chewy.style.fontFamily} />;
}
