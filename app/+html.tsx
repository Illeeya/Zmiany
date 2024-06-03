import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";
export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, shrink-to-fit=no"
                />
                <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
                <ScrollViewStyleReset />
            </head>
            <body>{children}</body>
        </html>
    );
}

const responsiveBackground = `
body {
  background-color: #000;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
