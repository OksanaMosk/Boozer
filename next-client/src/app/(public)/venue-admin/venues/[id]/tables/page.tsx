import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import TableClientWrapperComponent from "@/components/table-client-wrapper/TableClientWrapperComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Manage Tables Venue ${id} | Boozer`,
        description: `Manage Tables for Venue ${id} on Boozer.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function TablesPage({ params }:Props) {
  const {id} = await params

    return (
        <div
            style={{
                fontWeight: "bolder",
                margin: "0 auto",
                textAlign: "center"
            }}
        >
           <TableClientWrapperComponent id={id} />
            <ButtonGoBackComponent/>
        </div>
    );
}


