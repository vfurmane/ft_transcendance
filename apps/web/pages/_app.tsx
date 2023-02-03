import "../styles/global.css";
import Script from "next/script";
import Head from "next/head";
import { AppProps } from "next/app";
import { wrapper } from "../store/store";
import Websocket from "../components/Websocket";
import Auth from "../components/Auth";
import Routes from "../components/Routes";
import { Provider } from "react-redux";

function App({ Component, ...rest }: AppProps): JSX.Element {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;
  return (
    <>
      <Head>
        <style>
          @import
          url("https://fonts.googleapis.com/css2?family=Saira:wght@100&family=Press+Start+2P&family=Rubik+Vinyl&family=Lacquer&display=swap");
        </style>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD"
          crossOrigin="anonymous"
        ></link>
      </Head>
      <Provider store={store}>
        <Auth>
          <Websocket>
            <Routes>
              <Component {...pageProps} />
            </Routes>
          </Websocket>
        </Auth>
      </Provider>
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN"
        crossOrigin="anonymous"
      />
    </>
  );
}

export default App;
