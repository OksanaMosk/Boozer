import {NewsGlobalComponent} from "@/components/news-global-component/NewsGlobalComponent";
import {ButtonGoBackComponent} from "@/components/button-go-back-component/ButtonGoBackComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";


const NewsPage = () => {
    return (
         <div style={{margin: "40px auto", textAlign: "center" }}>
             <ButtonGoBackComponent/>
            <NewsGlobalComponent/>
             <ButtonScrollTopComponent/>
        </div>
    );
};

export default NewsPage;