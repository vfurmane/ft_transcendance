import '../styles/global.css';
import Head from "next/head";
import { AppProps } from 'next/app';
import { wrapper } from "../store/store";


function App({ Component, pageProps}: AppProps) : JSX.Element {
    return (
        <>
            <Head>
                <style>
                    @import
                    url('https://fonts.googleapis.com/css2?family=Saira:wght@100&family=Press+Start+2P&family=Rubik+Vinyl&family=Lacquer&display=swap');
                </style>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossOrigin="anonymous"></link>
            </Head>
            <Component {...pageProps} />
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossOrigin="anonymous"></script>
        </>
        );
}

export default wrapper.withRedux(App);
