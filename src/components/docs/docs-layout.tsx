import { ReactNode } from "react";
import AppContainer from "../app-container";



export const DocsLayout = ({ children }: { children: ReactNode }) =>
    <AppContainer maxWidth="sm">
        <div className="docs-page">
            {children}
            <div style={{ paddingBottom: 32 }} />
            <hr />
            <a href="https://twitter.com/jasperhartong" target="_Blank"> @jasperhartong</a>

            <p>
                <sub>©2020</sub>
            </p>
        </div>
    </AppContainer>