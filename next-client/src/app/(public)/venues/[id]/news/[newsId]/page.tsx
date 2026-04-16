import { NewSingleComponent } from "@/components/new-single-component/NewSingleComponent";
import { ButtonGoBackComponent } from "@/components/button-go-back-component/ButtonGoBackComponent";
import { Metadata } from "next";

interface Props {
    params: Promise<{ id: string; newsId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id, newsId } = await params;

    return {
        title: `News ${newsId} | Venue ${id} | Boozer`,
        description: "Latest updates and promotions",
    };
}

const NewsVenueDetailPage = async ({ params }: Props) => {
    const { newsId } = await params;

    return (
        <div style={{ fontWeight: "bolder", margin: "40px auto", textAlign: "center" }}>
                <ButtonGoBackComponent />
            <NewSingleComponent newsId={newsId} />
        </div>
    );
};

export default NewsVenueDetailPage;
