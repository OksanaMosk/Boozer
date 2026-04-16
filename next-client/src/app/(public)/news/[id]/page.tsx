import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {NewSingleComponent} from "@/components/new-single-component/NewSingleComponent";
import {Metadata} from "next";


interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `News ${id} | Boozer`,
        description: `Read the latest update ${id} in our global news feed.`,
    };
}

const NewPage = async (props: Props) => {
    const params = await props.params;

    const { id } = params;

    return (
        <div style={{margin: "40px auto", textAlign: "center"}}>
            <ButtonGoBackComponent/>
            <NewSingleComponent newsId={id}/>
        </div>
    );
};

export default NewPage;
