import { LoaderComponent } from "@/components/loader-component/LoaderComponent";

export default function Loading() {
    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 70 }}>
            <LoaderComponent />
        </div>
    );
}