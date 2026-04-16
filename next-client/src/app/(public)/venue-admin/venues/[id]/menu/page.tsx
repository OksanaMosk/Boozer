import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { ButtonScrollTopComponent } from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import MenuManagerComponent from "@/components/menu-manager-component/MenuManagerComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: ` Manage Menu for Venue ${id} | Boozer`,
        description: `Manage Menu for Venue ${id} on Boozer.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function MenuPage({ params }:Props) {
  const { id } = await params;

  return (
    <div style={{ fontWeight: "bolder", margin: "40px auto", textAlign: "center" }}>
      <ButtonGoBackComponent />
      <MenuManagerComponent venue={{ id }} menus={[]} />
      <ButtonScrollTopComponent />
    </div>
  );
}

