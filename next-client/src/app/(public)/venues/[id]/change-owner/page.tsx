import {Metadata} from "next";
import ChangeOwnerComponent from "@/components/change-owner-component/ChangeOwnerComponent";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Change Owner Venue ${id} | Boozer`,
        description: `ChangeOwner for Venue #${id} on Boozer.`,
    };
}


export default async function ChangeOwnerPage({ params }: Props) {
   const resolvedParams = await params;
   const venueId = resolvedParams.id;

    return (
        <div
            style={{
                margin: "40px auto",
                textAlign: "center",
            }}
        >
            <ChangeOwnerComponent venueId={venueId}/>
        </div>
    );
}
