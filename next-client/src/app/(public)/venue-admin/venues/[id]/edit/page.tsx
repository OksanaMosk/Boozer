import VenueEditComponent from "@/components/venue-edit-component/VenueEditComponent";
import {Metadata} from "next";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `Edit Venue ${id} | Boozer`,
        description: `Edit Venue ${id} on Boozer.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}


export default async function EditVenuePage({params}:Props) {
    const {id} = await params;

  return (
    <div>
      <VenueEditComponent venueId={id} />
    </div>
  );
}
