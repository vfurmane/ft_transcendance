import "../styles/global.css";
import Script from "next/script";
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
